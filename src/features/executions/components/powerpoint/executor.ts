import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import PptxGenJS from "pptxgenjs";
import type { NodeExecutor } from "@/features/executions/types";
import { powerpointChannel } from "@/inngest/channels/powerpoint";

export type PowerPointTheme =
  | "modern-dark"
  | "executive-navy"
  | "corporate-blue"
  | "minimalist-light"
  | "emerald"
  | "powerpoint-orange";

export type PowerPointNodeData = {
  variableName?: string;
  title?: string;
  subtitle?: string;
  author?: string;
  theme?: PowerPointTheme;
  content?: string;
};

interface ParsedSlide {
  title: string;
  subtitle?: string;
  bullets: string[];
  notes?: string;
}

const THEME_CONFIGS: Record<
  PowerPointTheme,
  {
    bg: string;
    cardBg: string;
    titleColor: string;
    accentColor: string;
    textColor: string;
    isDark: boolean;
  }
> = {
  "modern-dark": {
    bg: "0F172A",
    cardBg: "1E293B",
    titleColor: "FFFFFF",
    accentColor: "38BDF8",
    textColor: "CBD5E1",
    isDark: true,
  },
  "executive-navy": {
    bg: "1E3A8A",
    cardBg: "172554",
    titleColor: "FFFFFF",
    accentColor: "F59E0B",
    textColor: "E2E8F0",
    isDark: true,
  },
  "corporate-blue": {
    bg: "FFFFFF",
    cardBg: "F8FAFC",
    titleColor: "0F172A",
    accentColor: "2563EB",
    textColor: "334155",
    isDark: false,
  },
  "minimalist-light": {
    bg: "FAFAFA",
    cardBg: "FFFFFF",
    titleColor: "18181B",
    accentColor: "6366F1",
    textColor: "52525B",
    isDark: false,
  },
  emerald: {
    bg: "064E3B",
    cardBg: "042F2E",
    titleColor: "F0FDF4",
    accentColor: "10B981",
    textColor: "D1FAE5",
    isDark: true,
  },
  "powerpoint-orange": {
    bg: "FFFFFF",
    cardBg: "FFF7ED",
    titleColor: "7C2D12",
    accentColor: "EA580C",
    textColor: "374151",
    isDark: false,
  },
};

function parseSlidesContent(
  rawContent: string,
  defaultTitle: string,
): ParsedSlide[] {
  const trimmed = rawContent.trim();
  if (!trimmed) {
    return [
      {
        title: defaultTitle || "Introduction",
        bullets: [
          "Overview and objectives",
          "Key discussion points",
          "Next steps and deliverables",
        ],
      },
    ];
  }

  // Try parsing as JSON array
  if (
    trimmed.startsWith("[") ||
    (trimmed.startsWith("{") && trimmed.includes("slides"))
  ) {
    try {
      const parsed = JSON.parse(trimmed);
      const array = Array.isArray(parsed) ? parsed : parsed.slides;
      if (Array.isArray(array) && array.length > 0) {
        return array.map((s: Record<string, unknown>, idx: number) => ({
          title: String(s.title || `Slide ${idx + 1}`),
          subtitle: s.subtitle ? String(s.subtitle) : undefined,
          bullets: Array.isArray(s.bullets)
            ? s.bullets.map(String)
            : s.content
              ? String(s.content).split("\n").filter(Boolean)
              : [],
          notes: s.notes ? String(s.notes) : undefined,
        }));
      }
    } catch {
      // Fall back to Markdown parser
    }
  }

  // Parse Markdown (# Slide Title, ## Subtitle, - Bullets)
  const slides: ParsedSlide[] = [];
  // Split by horizontal rule or slide delimiter if present
  const rawSlideBlocks = trimmed.includes("\n---\n")
    ? trimmed.split(/\n---\n+/)
    : trimmed.split(/(?=\n# [^\n]+)/);

  for (let block of rawSlideBlocks) {
    block = block.trim();
    if (!block) continue;

    const lines = block.split("\n");
    let currentTitle = "";
    let currentSubtitle: string | undefined;
    const currentBullets: string[] = [];

    for (const line of lines) {
      const clean = line.trim();
      if (!clean) continue;

      if (clean.startsWith("# ")) {
        currentTitle = clean.replace(/^#\s+/, "").trim();
      } else if (clean.startsWith("## ")) {
        if (!currentSubtitle) {
          currentSubtitle = clean.replace(/^##\s+/, "").trim();
        } else {
          currentBullets.push(clean.replace(/^##\s+/, "").trim());
        }
      } else if (/^[-*•]\s+/.test(clean)) {
        currentBullets.push(clean.replace(/^[-*•]\s+/, "").trim());
      } else if (/^\d+\.\s+/.test(clean)) {
        currentBullets.push(clean.replace(/^\d+\.\s+/, "").trim());
      } else {
        if (!currentTitle) {
          currentTitle = clean;
        } else if (!currentSubtitle && currentBullets.length === 0) {
          currentSubtitle = clean;
        } else {
          currentBullets.push(clean);
        }
      }
    }

    if (currentTitle || currentBullets.length > 0) {
      slides.push({
        title: currentTitle || `Slide ${slides.length + 1}`,
        subtitle: currentSubtitle,
        bullets:
          currentBullets.length > 0
            ? currentBullets
            : ["Key highlight for this section"],
      });
    }
  }

  return slides.length > 0
    ? slides
    : [
        {
          title: defaultTitle || "Presentation",
          bullets: [trimmed],
        },
      ];
}

export const powerpointExecutor: NodeExecutor<PowerPointNodeData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  await step.realtime.publish(
    `publish-loading-${nodeId}`,
    powerpointChannel.status,
    {
      nodeId,
      status: "loading",
    },
  );

  try {
    const result = await step.run(
      `powerpoint-${data.variableName || nodeId}`,
      async () => {
        if (!data.variableName) {
          await step.realtime.publish(
            `publish-error-${nodeId}`,
            powerpointChannel.status,
            {
              nodeId,
              status: "error",
            },
          );
          throw new NonRetriableError(
            "PowerPoint node: Variable name not configured",
          );
        }

        // Compile templated values using Handlebars and workflow context
        const rawTitle = data.title || "Automated Presentation";
        const compiledTitle = Handlebars.compile(rawTitle)(context);

        const rawSubtitle = data.subtitle || "";
        const compiledSubtitle = rawSubtitle
          ? Handlebars.compile(rawSubtitle)(context)
          : "";

        const rawAuthor = data.author || "OtogentAI Workflow";
        const compiledAuthor = Handlebars.compile(rawAuthor)(context);

        const rawContent = data.content || "";
        const compiledContent = rawContent
          ? Handlebars.compile(rawContent)(context)
          : "";

        const selectedTheme = data.theme || "modern-dark";
        const theme =
          THEME_CONFIGS[selectedTheme] || THEME_CONFIGS["modern-dark"];

        const slides = parseSlidesContent(compiledContent, compiledTitle);

        // Initialize PptxGenJS instance
        const pres = new PptxGenJS();
        pres.layout = "LAYOUT_16x9";
        pres.title = compiledTitle;
        pres.author = compiledAuthor;

        // 1. Title Slide
        const titleSlide = pres.addSlide();
        titleSlide.background = { color: theme.bg };

        // Decorative top accent bar
        titleSlide.addShape(pres.ShapeType.rect, {
          x: 0,
          y: 0,
          w: "100%",
          h: 0.15,
          fill: { color: theme.accentColor },
        });

        // Title Box
        titleSlide.addText(compiledTitle, {
          x: 1.0,
          y: 2.2,
          w: 11.3,
          h: 1.6,
          fontSize: 40,
          bold: true,
          color: theme.titleColor,
          fontFace: "Calibri",
          valign: "middle",
        });

        // Subtitle Box
        if (compiledSubtitle) {
          titleSlide.addText(compiledSubtitle, {
            x: 1.0,
            y: 3.8,
            w: 11.3,
            h: 0.8,
            fontSize: 22,
            color: theme.accentColor,
            fontFace: "Calibri",
          });
        }

        // Author & Date Tagline
        titleSlide.addText(
          `${compiledAuthor}  •  ${new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}`,
          {
            x: 1.0,
            y: 5.6,
            w: 11.3,
            h: 0.5,
            fontSize: 13,
            color: theme.textColor,
            fontFace: "Calibri",
          },
        );

        // 2. Content Slides
        slides.forEach((s, idx) => {
          const slide = pres.addSlide();
          slide.background = { color: theme.bg };

          // Top header accent line
          slide.addShape(pres.ShapeType.rect, {
            x: 0.8,
            y: 0.5,
            w: 0.12,
            h: 0.8,
            fill: { color: theme.accentColor },
          });

          // Slide Title
          slide.addText(s.title, {
            x: 1.1,
            y: 0.45,
            w: 11.0,
            h: 0.8,
            fontSize: 28,
            bold: true,
            color: theme.titleColor,
            fontFace: "Calibri",
            valign: "middle",
          });

          // Subtitle / context
          let contentY = 1.6;
          if (s.subtitle) {
            slide.addText(s.subtitle, {
              x: 1.1,
              y: 1.35,
              w: 11.0,
              h: 0.4,
              fontSize: 15,
              italic: true,
              color: theme.accentColor,
              fontFace: "Calibri",
            });
            contentY = 1.9;
          }

          // Content card background
          slide.addShape(pres.ShapeType.roundRect, {
            x: 0.9,
            y: contentY,
            w: 11.5,
            h: 4.8,
            rectRadius: 0.1,
            fill: { color: theme.cardBg },
            line: { color: theme.accentColor, width: 0.5, dashType: "solid" },
          });

          // Bullet points
          if (s.bullets.length > 0) {
            const bulletItems = s.bullets.map((b) => ({
              text: b,
              options: {
                fontSize: 18,
                color: theme.textColor,
                fontFace: "Calibri",
                bullet: { type: "bullet" as const, code: "2022" },
                lineSpacing: 32,
                spaceAfter: 12,
              },
            }));

            slide.addText(bulletItems, {
              x: 1.3,
              y: contentY + 0.3,
              w: 10.7,
              h: 4.2,
              valign: "top",
            });
          }

          // Slide Notes
          if (s.notes) {
            slide.addNotes(s.notes);
          }

          // Footer with presentation title and slide numbers
          slide.addText(
            `${compiledTitle}  |  Slide ${idx + 2} of ${slides.length + 1}`,
            {
              x: 1.0,
              y: 6.8,
              w: 11.3,
              h: 0.35,
              fontSize: 10,
              color: theme.textColor,
              fontFace: "Calibri",
            },
          );
        });

        // Generate Base64
        const base64Data = (await pres.write({
          outputType: "base64",
        })) as string;
        const safeFileName = `${compiledTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pptx`;
        const dataUrl = `data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64,${base64Data}`;

        return {
          ...context,
          [data.variableName]: {
            title: compiledTitle,
            subtitle: compiledSubtitle,
            slideCount: slides.length + 1,
            fileName: safeFileName,
            theme: selectedTheme,
            base64: base64Data,
            dataUrl,
            slides: slides.map((s) => ({
              title: s.title,
              subtitle: s.subtitle,
              bullets: s.bullets,
            })),
          },
        };
      },
    );

    await step.realtime.publish(
      `publish-success-${nodeId}`,
      powerpointChannel.status,
      {
        nodeId,
        status: "success",
      },
    );

    return result;
  } catch (error) {
    await step.realtime.publish(
      `publish-error-${nodeId}`,
      powerpointChannel.status,
      {
        nodeId,
        status: "error",
      },
    );
    throw error;
  }
};
