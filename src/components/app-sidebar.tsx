'use client'

import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { MessageSquareText, UserRound } from 'lucide-react'

const data = [
  {
    title: 'Users',
    url: '/users',
    icon: UserRound,
  },
  {
    title: 'Posts',
    url: '/posts',
    icon: MessageSquareText,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile()

  return (
    <Sidebar
      className={isMobile ? 'w-[3rem] transition-all duration-300' : ''}
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
  )
}
