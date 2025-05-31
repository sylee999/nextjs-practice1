import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AvatarComponentProps } from "@/types/components"
import type { User } from "@/types/user"

/**
 * Default user data for non-authenticated users
 */
const DEFAULT_GUEST_USER: Partial<User> = {
  id: "",
  name: "Guest",
  avatar: "",
  email: "",
} as const

/**
 * Size configuration for avatar component
 */
const AVATAR_SIZES = {
  sm: "size-6",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
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

  return (
    <Avatar className={`${sizeClass} ${className}`.trim()}>
      <AvatarImage
        src={displayUser.avatar || ""}
        alt={`${displayUser.name || "Guest"} avatar`}
      />
      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
        {(displayUser.name || "G").charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
