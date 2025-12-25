import AppSideBar from "@/components/custom/app-side-bar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset className="bg-sidebar h-full">{children}</SidebarInset>
    </SidebarProvider>
  );
}
