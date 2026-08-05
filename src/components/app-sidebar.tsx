"use client"

import {
    CreditCardIcon,
    FolderIcon,
    HistoryIcon,
    KeyIcon,
    LogOutIcon,
    Route,
    StarIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { useHasActiveSubscription } from "@/features/subscriptions/hooks/use-subscription";

const menuItems = [
    {
        title: "Home",
        items: [
            {
                title: "Workflows",
                icon: FolderIcon,
                url: "/workflows",
            },
            {
                title: "Credentials",
                icon: KeyIcon,
                url: "/credentials",
            },
            {
                title: "Executions",
                icon: HistoryIcon,
                url: "/executions",
            },
        ]

    }
];

export const AppSidebar = () => {
    const { hasActiveSubscription, isLoading } = useHasActiveSubscription();
    const pathname = usePathname();
    const router = useRouter();
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
                        <Link prefetch href={"/"}>
                            <Image src={"/logo.png"} alt="OtogentAI" width={30} height={30} />
                            <span className="font-serif text-lg">OtogentAI</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((items) => <SidebarMenuItem key={items.title}>
                                    <SidebarMenuButton
                                        tooltip={items.title}
                                        isActive={items.url === "/" ? pathname === "/" : pathname.startsWith(items.url)}
                                        asChild
                                        className="gap-x-4 h-10 px-4"
                                    >
                                        <Link href={items.url} prefetch>
                                            <items.icon className="size-4" />
                                            <span>{items.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>)}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    {!hasActiveSubscription && !isLoading && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                tooltip="Upgrade to Pro"
                                onClick={() => authClient.checkout({ slug: "project-x-pro" })}
                                className="gap-x-4 h-10 px-4"
                            >
                                <StarIcon className="size-4" />
                                <span>Upgrade to Pro</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Billing Portal"
                            onClick={() => { }}
                            className="gap-x-4 h-10 px-4"
                        >
                            <CreditCardIcon className="size-4" />
                            <span>Billing Portal</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Logout"
                            onClick={() => authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        router.push("/login");
                                    },
                                },
                            })}
                            className="gap-x-4 h-10 px-4"
                        >
                            <LogOutIcon className="size-4" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}