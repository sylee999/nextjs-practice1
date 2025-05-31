import type { ReactNode } from "react"

import type { Post } from "./post"
import type { User } from "./user"

/**
 * Base props interface for components that accept children
 */
export interface ComponentWithChildren {
  children?: ReactNode
}

/**
 * Base props interface for components that extend HTML element props
 */
export interface BaseComponentProps extends React.ComponentProps<"div"> {
  className?: string
}

/**
 * Form mode type for components that handle both create and edit operations
 */
export type FormMode = "create" | "edit"

/**
 * Common form state interface
 */
export interface FormState {
  message: string
  success?: boolean
}

/**
 * Enhanced form state for operations that return an ID (like create operations)
 */
export interface FormStateWithId extends FormState {
  id?: string
}

/**
 * Props for form components that handle both create and edit modes
 */
export interface FormModeProps<T> {
  mode: FormMode
  initialData: T
}

/**
 * User-related component props
 */
export interface UserComponentProps {
  user: User | null
}

export interface UserListProps {
  users: User[]
}

export interface UserFormData {
  [key: string]: string | undefined
  id?: string
  avatar: string
  name: string
  email: string
  password?: string
}

export interface UserFormProps
  extends FormModeProps<UserFormData>,
    React.ComponentProps<"form"> {}

/**
 * Post-related component props
 */
export interface PostComponentProps {
  post: Post
}

export interface PostListProps {
  posts: Post[]
}

export interface PostFormData {
  [key: string]: string | undefined
  id?: string
  title: string
  content: string
}

export interface PostFormProps
  extends FormModeProps<PostFormData>,
    React.ComponentProps<"form"> {}

/**
 * Submit button props for form components
 */
export interface SubmitButtonProps {
  mode: FormMode
  hasChanges: boolean
  pending?: boolean
}

/**
 * Loading state props
 */
export interface LoadingProps {
  isLoading: boolean
  loadingText?: string
}

/**
 * Error state props
 */
export interface ErrorProps {
  error: Error | string | null
  onRetry?: () => void
}

/**
 * Avatar component props
 */
export interface AvatarComponentProps {
  user: User | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

/**
 * Search form props
 */
export interface SearchFormProps extends React.ComponentProps<"form"> {
  placeholder?: string
  defaultValue?: string
}

/**
 * Dialog/Modal component props
 */
export interface DialogComponentProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}

/**
 * Delete confirmation dialog props
 */
export interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  itemName: string
  isDeleting?: boolean
}
