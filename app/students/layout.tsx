import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar role="students" />
      <main className="flex-1 h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 border-b bg-background p-4">
          <SidebarTrigger />
        </header>
        <section className="p-6">
        {children}
        </section>
      </main>
    </SidebarProvider>
  )
}
