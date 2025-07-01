import { render } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { AppSidebar } from "./app-sidebar"
import { SidebarProvider } from "./ui/sidebar"

// Mock the hooks
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}))

describe("AppSidebar", () => {
  test("contains correct navigation links", () => {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    )

    // Check for Home link
    const homeLink = container.querySelector('a[href="/home"]')
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveTextContent("Home")

    // Check for Users link
    const usersLink = container.querySelector('a[href="/user"]')
    expect(usersLink).toBeInTheDocument()
    expect(usersLink).toHaveTextContent("Users")

    // Check for Posts link
    const postsLink = container.querySelector('a[href="/post"]')
    expect(postsLink).toBeInTheDocument()
    expect(postsLink).toHaveTextContent("Posts")
  })

  test("Home link is first in navigation", () => {
    const { container } = render(
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    )

    // Get all navigation links
    const links = container.querySelectorAll("a")

    // First link should be Home
    expect(links[0]).toHaveAttribute("href", "/home")
    expect(links[0]).toHaveTextContent("Home")
  })
})
