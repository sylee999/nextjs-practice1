import { useActionState } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useFormStatus } from "react-dom"
import { Mock, vi } from "vitest"

import { UserForm } from "./user-form"

// Mock Next.js navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}))

// Mock user actions
vi.mock("@/app/user/actions", () => ({
  createUserAction: vi.fn(),
  updateUserAction: vi.fn(),
}))

// Mock React hooks
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>()
  return {
    ...actual,
    useActionState: vi.fn(),
  }
})

vi.mock("react-dom", () => ({
  useFormStatus: vi.fn(),
}))

// Mock component dependencies
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock("@/components/ui/alert", () => ({
  Alert: ({ children, ...props }: any) => (
    <div data-testid="alert" {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: any) => (
    <div data-testid="alert-description">{children}</div>
  ),
}))

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, ...props }: any) => (
    <div data-testid="avatar" {...props}>
      {children}
    </div>
  ),
  AvatarFallback: ({ children }: any) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
  AvatarImage: ({ alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="avatar-image" alt={alt} {...props} />
  ),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}))

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))
/* eslint-enable @typescript-eslint/no-explicit-any */

describe("UserForm", () => {
  const mockUseActionState = useActionState as Mock
  const mockUseFormStatus = useFormStatus as Mock

  // Mock form action function
  const mockFormAction = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementations
    mockUseFormStatus.mockReturnValue({ pending: false })
    mockUseActionState.mockReturnValue([
      { message: "", success: false },
      mockFormAction,
      false, // pending
    ])
  })

  describe("Create Mode", () => {
    const createModeProps = {
      mode: "create" as const,
      initialData: {
        avatar: "",
        name: "",
        email: "",
        password: "",
      },
    }

    test("renders create form with correct title and fields", () => {
      render(<UserForm {...createModeProps} />)

      expect(screen.getByText("Create your account")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Enter your details below to create your account and set up your profile"
        )
      ).toBeInTheDocument()

      expect(screen.getByLabelText("Name")).toBeInTheDocument()
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
      expect(screen.getByLabelText("Password")).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Sign up" })
      ).toBeInTheDocument()
    })

    test("all fields are enabled in create mode", () => {
      render(<UserForm {...createModeProps} />)

      const nameInput = screen.getByLabelText("Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      expect(nameInput).not.toBeDisabled()
      expect(emailInput).not.toBeDisabled()
      expect(passwordInput).not.toBeDisabled()
    })

    test("password field is required in create mode", () => {
      render(<UserForm {...createModeProps} />)

      const passwordInput = screen.getByLabelText("Password")
      expect(passwordInput).toHaveAttribute("required")
      expect(passwordInput).toHaveAttribute("minLength", "8")
    })

    test("updates form fields correctly", async () => {
      const user = userEvent.setup()
      render(<UserForm {...createModeProps} />)

      const nameInput = screen.getByLabelText("Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      await user.type(nameInput, "John Doe")
      await user.type(emailInput, "john@example.com")
      await user.type(passwordInput, "password123")

      expect(nameInput).toHaveValue("John Doe")
      expect(emailInput).toHaveValue("john@example.com")
      expect(passwordInput).toHaveValue("password123")
    })

    test("updates avatar when email changes", async () => {
      const user = userEvent.setup()
      render(<UserForm {...createModeProps} />)

      const emailInput = screen.getByLabelText("Email")
      const avatarInput = document.querySelector(
        'input[name="avatar"]'
      ) as HTMLInputElement

      await user.type(emailInput, "test@example.com")

      await waitFor(() => {
        expect(avatarInput).toHaveValue(
          "https://i.pravatar.cc/150?u=test@example.com"
        )
      })
    })

    test("submits form with create action", async () => {
      const user = userEvent.setup()
      render(<UserForm {...createModeProps} />)

      // Fill out required fields first
      const nameInput = screen.getByLabelText("Name")
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")

      await user.type(nameInput, "John Doe")
      await user.type(emailInput, "john@example.com")
      await user.type(passwordInput, "password123")

      const submitButton = screen.getByRole("button", { name: "Sign up" })
      await user.click(submitButton)

      expect(mockFormAction).toHaveBeenCalled()
    })

    test("shows loading state during form submission", () => {
      mockUseActionState.mockReturnValue([
        { message: "", success: false },
        mockFormAction,
        true, // pending
      ])

      render(<UserForm {...createModeProps} />)

      const submitButton = screen.getByRole("button", {
        name: "Creating account...",
      })
      expect(submitButton).toBeDisabled()
    })

    test("displays error message on failed submission", () => {
      mockUseActionState.mockReturnValue([
        { message: "Email already exists", success: false },
        mockFormAction,
        false,
      ])

      render(<UserForm {...createModeProps} />)

      expect(screen.getByTestId("alert")).toBeInTheDocument()
      expect(screen.getByTestId("alert-description")).toHaveTextContent(
        "Email already exists"
      )
    })

    test("navigates on successful creation", () => {
      mockUseActionState.mockReturnValue([
        { message: "", id: "123", success: true },
        mockFormAction,
        false,
      ])

      render(<UserForm {...createModeProps} />)

      expect(mockRefresh).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith("/user/123")
    })

    test("does not show cancel button in create mode", () => {
      render(<UserForm {...createModeProps} />)

      expect(
        screen.queryByRole("button", { name: "Cancel" })
      ).not.toBeInTheDocument()
    })
  })

  describe("Edit Mode", () => {
    const editModeProps = {
      mode: "edit" as const,
      initialData: {
        id: "123",
        avatar: "https://i.pravatar.cc/150?u=john@example.com",
        name: "John Doe",
        email: "john@example.com",
        password: "",
      },
    }

    test("renders edit form with correct title and fields", () => {
      render(<UserForm {...editModeProps} />)

      expect(screen.getByText("Update your profile")).toBeInTheDocument()
      expect(
        screen.getByText("Update your information below to modify your profile")
      ).toBeInTheDocument()

      expect(screen.getByLabelText("Name")).toBeInTheDocument()
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
      expect(
        screen.getByLabelText("New Password (optional)")
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Update Profile" })
      ).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
    })

    test("populates form with initial data", () => {
      render(<UserForm {...editModeProps} />)

      expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument()
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument()
      expect(screen.getByDisplayValue("123")).toBeInTheDocument() // hidden ID field
    })

    test("email field is disabled in edit mode", () => {
      render(<UserForm {...editModeProps} />)

      const emailInput = screen.getByLabelText("Email")
      expect(emailInput).toBeDisabled()
    })

    test("password field is optional in edit mode", () => {
      render(<UserForm {...editModeProps} />)

      const passwordInput = screen.getByLabelText("New Password (optional)")
      expect(passwordInput).not.toHaveAttribute("required")
      expect(passwordInput).toHaveAttribute(
        "placeholder",
        "Leave blank to keep current password"
      )
    })

    test("submit button is disabled when no changes are made", () => {
      render(<UserForm {...editModeProps} />)

      const submitButton = screen.getByRole("button", {
        name: "Update Profile",
      })
      expect(submitButton).toBeDisabled()
    })

    test("submit button is enabled when changes are made", async () => {
      const user = userEvent.setup()
      render(<UserForm {...editModeProps} />)

      const nameInput = screen.getByLabelText("Name")
      await user.clear(nameInput)
      await user.type(nameInput, "Jane Doe")

      const submitButton = screen.getByRole("button", {
        name: "Update Profile",
      })
      expect(submitButton).not.toBeDisabled()
    })

    test("detects changes correctly for name field", async () => {
      const user = userEvent.setup()
      render(<UserForm {...editModeProps} />)

      const nameInput = screen.getByLabelText("Name")
      const submitButton = screen.getByRole("button", {
        name: "Update Profile",
      })

      // Initially disabled (no changes)
      expect(submitButton).toBeDisabled()

      // Make a change
      await user.clear(nameInput)
      await user.type(nameInput, "Jane Doe")
      expect(submitButton).not.toBeDisabled()

      // Revert change
      await user.clear(nameInput)
      await user.type(nameInput, "John Doe")
      expect(submitButton).toBeDisabled()
    })

    test("detects changes correctly for password field", async () => {
      const user = userEvent.setup()
      render(<UserForm {...editModeProps} />)

      const passwordInput = screen.getByLabelText("New Password (optional)")
      const submitButton = screen.getByRole("button", {
        name: "Update Profile",
      })

      // Initially disabled (no changes)
      expect(submitButton).toBeDisabled()

      // Add password
      await user.type(passwordInput, "newpassword123")
      expect(submitButton).not.toBeDisabled()

      // Clear password (should be disabled again since empty password = no change)
      await user.clear(passwordInput)
      expect(submitButton).toBeDisabled()
    })

    test("submits form with update action", async () => {
      const user = userEvent.setup()
      render(<UserForm {...editModeProps} />)

      // Make a change to enable submit
      const nameInput = screen.getByLabelText("Name")
      await user.clear(nameInput)
      await user.type(nameInput, "Jane Doe")

      const submitButton = screen.getByRole("button", {
        name: "Update Profile",
      })
      await user.click(submitButton)

      expect(mockFormAction).toHaveBeenCalled()
    })

    test("shows loading state during form submission", async () => {
      const user = userEvent.setup()

      // First render with changes made
      const { rerender } = render(<UserForm {...editModeProps} />)

      const nameInput = screen.getByLabelText("Name")
      await user.clear(nameInput)
      await user.type(nameInput, "Jane Doe")

      // Now mock pending state
      mockUseActionState.mockReturnValue([
        { message: "", success: false },
        mockFormAction,
        true, // pending
      ])

      rerender(<UserForm {...editModeProps} />)

      const submitButton = screen.getByRole("button", {
        name: "Updating profile...",
      })
      expect(submitButton).toBeDisabled()
    })

    test("handles cancel button click", async () => {
      const user = userEvent.setup()
      render(<UserForm {...editModeProps} />)

      const cancelButton = screen.getByRole("button", { name: "Cancel" })
      await user.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith("/user/123")
    })

    test("cancel button is disabled during form submission", () => {
      mockUseActionState.mockReturnValue([
        { message: "", success: false },
        mockFormAction,
        true, // pending
      ])

      render(<UserForm {...editModeProps} />)

      const cancelButton = screen.getByRole("button", { name: "Cancel" })
      expect(cancelButton).toBeDisabled()
    })

    test("displays error message on failed update", () => {
      mockUseActionState.mockReturnValue([
        { message: "Update failed", success: false },
        mockFormAction,
        false,
      ])

      render(<UserForm {...editModeProps} />)

      expect(screen.getByTestId("alert")).toBeInTheDocument()
      expect(screen.getByTestId("alert-description")).toHaveTextContent(
        "Update failed"
      )
    })

    test("navigates on successful update", () => {
      mockUseActionState.mockReturnValue([
        { message: "", success: true },
        mockFormAction,
        false,
      ])

      render(<UserForm {...editModeProps} />)

      expect(mockRefresh).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith("/user/123")
    })

    test("includes hidden ID field for update", () => {
      render(<UserForm {...editModeProps} />)

      const hiddenIdInput = screen.getByDisplayValue("123")
      expect(hiddenIdInput).toHaveAttribute("type", "hidden")
      expect(hiddenIdInput).toHaveAttribute("name", "id")
    })
  })

  describe("Shared Functionality", () => {
    test("renders avatar with correct src based on email", () => {
      const props = {
        mode: "create" as const,
        initialData: {
          avatar: "",
          name: "",
          email: "test@example.com",
          password: "",
        },
      }

      render(<UserForm {...props} />)

      const avatarImages = screen.getAllByTestId("avatar-image")
      const mainAvatarImage = avatarImages.find(
        (img) => img.getAttribute("alt") === "Auto generated avatar"
      )
      expect(mainAvatarImage).toHaveAttribute(
        "src",
        "https://i.pravatar.cc/150?u=test@example.com"
      )
      expect(mainAvatarImage).toHaveAttribute("alt", "Auto generated avatar")
    })

    test("renders default avatar when no email", () => {
      const props = {
        mode: "create" as const,
        initialData: {
          avatar: "",
          name: "",
          email: "",
          password: "",
        },
      }

      render(<UserForm {...props} />)

      const avatarImages = screen.getAllByTestId("avatar-image")
      const mainAvatarImage = avatarImages.find(
        (img) => img.getAttribute("alt") === "Auto generated avatar"
      )
      expect(mainAvatarImage).toHaveAttribute("src", "/default-avatar.png")
    })

    test("disables all inputs during form submission", () => {
      mockUseActionState.mockReturnValue([
        { message: "", success: false },
        mockFormAction,
        true, // pending
      ])

      const props = {
        mode: "create" as const,
        initialData: {
          avatar: "",
          name: "",
          email: "",
          password: "",
        },
      }

      render(<UserForm {...props} />)

      expect(screen.getByLabelText("Name")).toBeDisabled()
      expect(screen.getByLabelText("Email")).toBeDisabled()
      expect(screen.getByLabelText("Password")).toBeDisabled()
    })

    test("does not display alert when no error message", () => {
      const props = {
        mode: "create" as const,
        initialData: {
          avatar: "",
          name: "",
          email: "",
          password: "",
        },
      }

      render(<UserForm {...props} />)

      expect(screen.queryByTestId("alert")).not.toBeInTheDocument()
    })

    test("does not display alert when success is true", () => {
      mockUseActionState.mockReturnValue([
        { message: "Success message", success: true },
        mockFormAction,
        false,
      ])

      const props = {
        mode: "create" as const,
        initialData: {
          avatar: "",
          name: "",
          email: "",
          password: "",
        },
      }

      render(<UserForm {...props} />)

      expect(screen.queryByTestId("alert")).not.toBeInTheDocument()
    })

    test("passes additional props to form element", () => {
      const props = {
        mode: "create" as const,
        initialData: {
          avatar: "",
          name: "",
          email: "",
          password: "",
        },
        "data-testid": "user-form",
        className: "custom-form",
      }

      render(<UserForm {...props} />)

      const formElement = screen.getByTestId("user-form")
      expect(formElement).toHaveClass("custom-form")
    })
  })
})
