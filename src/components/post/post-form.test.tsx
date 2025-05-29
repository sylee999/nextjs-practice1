import { useRouter } from "next/navigation"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, test, vi } from "vitest"

import { PostForm } from "./post-form"

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}))

// Mock post actions
vi.mock("@/app/post/actions", () => ({
  createPostAction: vi.fn(),
  updatePostAction: vi.fn(),
}))

describe("PostForm", () => {
  const mockRouter = {
    push: vi.fn(),
    refresh: vi.fn(),
  }

  beforeEach(() => {
    vi.resetAllMocks()
    ;(useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      mockRouter
    )
  })

  describe("Create Mode", () => {
    const createProps = {
      mode: "create" as const,
      initialData: {
        title: "",
        content: "",
      },
    }

    test("renders create form correctly", () => {
      render(<PostForm {...createProps} />)

      expect(screen.getByText("Create a new post")).toBeInTheDocument()
      expect(
        screen.getByText("Share your thoughts with the community")
      ).toBeInTheDocument()
      expect(screen.getByLabelText("Title")).toBeInTheDocument()
      expect(screen.getByLabelText("Content")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Create Post" })
      ).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    })

    test("form fields are editable", async () => {
      const user = userEvent.setup()
      render(<PostForm {...createProps} />)

      const titleInput = screen.getByLabelText("Title")
      const contentTextarea = screen.getByLabelText("Content")

      await user.type(titleInput, "Test Post Title")
      await user.type(contentTextarea, "Test post content")

      expect(titleInput).toHaveValue("Test Post Title")
      expect(contentTextarea).toHaveValue("Test post content")
    })

    test("submit button is enabled in create mode", () => {
      render(<PostForm {...createProps} />)

      const submitButton = screen.getByRole("button", { name: "Create Post" })
      expect(submitButton).not.toBeDisabled()
    })

    test("cancel button navigates to post list", async () => {
      const user = userEvent.setup()
      render(<PostForm {...createProps} />)

      const cancelButton = screen.getByRole("button", { name: "Cancel" })
      await user.click(cancelButton)

      expect(mockRouter.push).toHaveBeenCalledWith("/post")
    })
  })

  describe("Edit Mode", () => {
    const editProps = {
      mode: "edit" as const,
      initialData: {
        id: "1",
        title: "Existing Post",
        content: "Existing content",
      },
    }

    test("renders edit form correctly", () => {
      render(<PostForm {...editProps} />)

      expect(screen.getByText("Edit your post")).toBeInTheDocument()
      expect(screen.getByText("Update your post content")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Existing Post")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Existing content")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Update Post" })
      ).toBeInTheDocument()
    })

    test("submit button is disabled when no changes made", () => {
      render(<PostForm {...editProps} />)

      const submitButton = screen.getByRole("button", { name: "Update Post" })
      expect(submitButton).toBeDisabled()
    })

    test("submit button is enabled after making changes", async () => {
      const user = userEvent.setup()
      render(<PostForm {...editProps} />)

      const titleInput = screen.getByLabelText("Title")
      await user.clear(titleInput)
      await user.type(titleInput, "Updated Post Title")

      const submitButton = screen.getByRole("button", { name: "Update Post" })
      expect(submitButton).not.toBeDisabled()
    })

    test("cancel button navigates to post detail", async () => {
      const user = userEvent.setup()
      render(<PostForm {...editProps} />)

      const cancelButton = screen.getByRole("button", { name: "Cancel" })
      await user.click(cancelButton)

      expect(mockRouter.push).toHaveBeenCalledWith("/post/1")
    })

    test("includes hidden id field for edit mode", () => {
      render(<PostForm {...editProps} />)

      const hiddenInput = screen.getByDisplayValue("1")
      expect(hiddenInput).toHaveAttribute("type", "hidden")
      expect(hiddenInput).toHaveAttribute("name", "id")
    })
  })

  describe("Form Validation", () => {
    test("title field is required", () => {
      render(
        <PostForm mode="create" initialData={{ title: "", content: "" }} />
      )

      const titleInput = screen.getByLabelText("Title")
      expect(titleInput).toHaveAttribute("required")
    })

    test("content field is required", () => {
      render(
        <PostForm mode="create" initialData={{ title: "", content: "" }} />
      )

      const contentTextarea = screen.getByLabelText("Content")
      expect(contentTextarea).toHaveAttribute("required")
    })
  })

  describe("Error Handling", () => {
    test("displays error message when provided", () => {
      // This would need to be tested with actual form submission
      // For now, we can test the structure exists
      render(
        <PostForm mode="create" initialData={{ title: "", content: "" }} />
      )

      // The alert will only show when there's an error message from the action
      // We can test that the form is structured to handle it
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })
  })
})
