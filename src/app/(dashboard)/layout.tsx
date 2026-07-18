import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-accent/10">
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
};

export default Layout;