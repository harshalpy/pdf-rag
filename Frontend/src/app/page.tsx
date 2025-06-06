import { ChatComponent } from "@/components/globals/ChatComponent";
import { AppSidebar } from "@/components/globals/SideBar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                <ChatComponent />
            </SidebarInset>
        </SidebarProvider>
    );
}