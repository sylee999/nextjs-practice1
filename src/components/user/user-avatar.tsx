import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AvatarComponentProps } from "@/types/components"
import type { User } from "@/types/user"

/**
 * Default user data for non-authenticated users
 */
const DEFAULT_GUEST_USER: Partial<User> = {
  id: "",
  name: "Guest",
  avatar: "/default-avatar.png",
  email: "",
} as const

/**
 * Size configuration for avatar component
 */
const AVATAR_SIZES = {
  sm: "size-6", // 24px
  md: "size-8", // 32px
  lg: "size-12", // 48px
  xl: "size-16", // 64px
  "2xl": "size-32", // 128px
  "3xl": "size-48", // 192px
} as const

/**
 * Text size configuration for avatar fallback based on avatar size
 */
const FALLBACK_TEXT_SIZES = {
  sm: "text-xs",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
  "2xl": "text-2xl",
  "3xl": "text-4xl",
} as const

/**
 * UserAvatar component for displaying user profile pictures
 * Handles both authenticated and guest users with proper fallbacks
 *
 * @param user - User object or null for guest users
 * @param size - Avatar size variant
 * @param className - Additional CSS classes
 */
export function UserAvatar({
  user,
  size = "md",
  className = "",
}: AvatarComponentProps): React.JSX.Element {
  const displayUser = user || DEFAULT_GUEST_USER
  const sizeClass = AVATAR_SIZES[size]
  const textSizeClass = FALLBACK_TEXT_SIZES[size]

  return (
    <Avatar className={`${sizeClass} ${className}`.trim()}>
      <AvatarImage
        src={displayUser.avatar || ""}
        alt={`${displayUser.name || "Guest"} avatar`}
      />
      <AvatarFallback
        className={`bg-primary text-primary-foreground ${textSizeClass}`}
      >
        {(displayUser.name || "G").charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
