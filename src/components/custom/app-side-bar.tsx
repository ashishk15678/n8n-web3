"use client";

import {
  CommandIcon,
  CreditCardIcon,
  DockIcon,
  FolderIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  NotepadTextDashedIcon,
  StarIcon,
} from "lucide-react";
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
} from "../ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/auth-client";
import { useHasActiveSubscription } from "@/features/subsciption/hooks/use-subscription";
import { ModeToggle } from "@/features/theme-toggler";
import { cn } from "@/lib/utils";

export default function AppSideBar() {
  const menuItems = [
    {
      title: "Main",
      items: [
        {
          title: "Workflows",
          icon: DockIcon,
          url: "/workflows",
        },
        {
          title: "Credentials",
          icon: CommandIcon,
          url: "/credentials",
        },
        {
          title: "Executions",
          icon: HistoryIcon,
          url: "/executions",
        },
      ],
    },
  ];

  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, hasActiveSubscription } = useHasActiveSubscription();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="bg-accent ring-none outline-none border-none"
    >
      <SidebarHeader>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            className="gap-x-4 h-10 px-4 hover:bg-sidebar"
          >
            <Link href={"/workflows"} prefetch>
              <NotepadTextDashedIcon width={30} height={30} />
              <span className="font-semibold text-sm">N8N</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="px-4">
          {menuItems.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupContent>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className="gap-x-10 h-10 px-4 hover:bg-background/50  rounded-2xl"
                    >
                      <Link
                        href={item.url}
                        prefetch
                        className={cn(
                          (item.url == "/"
                            ? pathname == "/"
                            : pathname.startsWith(item.url)) &&
                            "bg-background/50 shadow-md shadow-primary",
                        )}
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuItem>
          <ModeToggle />
        </SidebarMenuItem>
        {!hasActiveSubscription && !isLoading && (
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"Upgrade to Pro"}
              className="
            gap-x-4 h-10 px-4"
              onClick={() => {
                authClient.checkout({ slug: "pro" });
              }}
            >
              <StarIcon className="h-4 w-4" />
              <span>Upgrade to Pro</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={"Billing Portal"}
            className="
            gap-x-4 h-10 px-4"
            onClick={() => {
              authClient.customer.portal();
            }}
          >
            <CreditCardIcon className="h-4 w-4" />
            <span>Billing Portal</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            tooltip={"Log out"}
            className="
            gap-x-4 h-10 px-4 hover:bg-gradient-to-r hover:from-red-100 hover:to-red-200"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => router.push("/login"),
                },
              });
            }}
          >
            <LogOutIcon className="h-4 w-4" />
            <span>Log out</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarFooter>
    </Sidebar>
  );
}
