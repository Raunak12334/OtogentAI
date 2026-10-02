import "dotenv/config";
import prisma from "../src/lib/db";

async function main() {
  const credentials = await prisma.credential.findMany({
    where: { type: "GOOGLE" as any },
  });

  const cred = credentials[0];
  const serviceAccountKey = JSON.parse(cred.value);

  const { google } = await import("googleapis");
  const auth = new google.auth.JWT({
    email: serviceAccountKey.client_email,
    key: serviceAccountKey.private_key,
    scopes: ["https://www.googleapis.com/auth/presentations"],
  });

  const slides = google.slides({ version: "v1", auth });
  const presentationId = "1zrSxUbqtsEeroGZ0UKxhFRUwgUvBtalWrCfpzczt6lk";

  const pres = await slides.presentations.get({ presentationId });

  // Let's find Slide 1 & Slide 2 shapes
  const slide1 = pres.data.slides?.[0];
  const slide2 = pres.data.slides?.[1];

  console.log("=== SLIDE 1 SHAPES ===");
  for (const el of slide1?.pageElements || []) {
    if (el.shape?.text?.textElements) {
      const txt = el.shape.text.textElements.map(t => t.textRun?.content || "").join("");
      console.log(`[ID: ${el.objectId}] text: "${txt.replace(/\n/g, "\\n")}"`);
    }
  }

  console.log("\n=== SLIDE 2 SHAPES ===");
  for (const el of slide2?.pageElements || []) {
    if (el.shape?.text?.textElements) {
      const txt = el.shape.text.textElements.map(t => t.textRun?.content || "").join("");
      console.log(`[ID: ${el.objectId}] text: "${txt.replace(/\n/g, "\\n")}"`);
    }
  }
}

main().catch((err) => console.error(err));
