"use client"

import * as React from "react"
import { MessageSquareText, UserRound } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const data = [
  {
    title: "Users",
    url: "/user",
    icon: UserRound,
  },
  {
    title: "Posts",
    url: "/post",
    icon: MessageSquareText,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile()

  const width = isMobile ? "3rem" : "var(--sidebar-width)"

  return (
    <div style={{ width }} className="shrink-0">
      <Sidebar
        className={cn(
          isMobile ? "w-[3rem] transition-all duration-300" : "",
          "fixed top-[var(--header-height)] bottom-0 left-0 z-10"
        )}
        collapsible="none"
        {...props}
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {data.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  )
}
