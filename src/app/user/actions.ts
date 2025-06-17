"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { getUserApiUrl } from "@/lib/api"
import {
  APIError,
  AuthenticationError,
  isAPIError,
  NotFoundError,
} from "@/types/errors"
import { CreateUserData, UpdateUserData, User } from "@/types/user"

import { checkAuth } from "../auth/actions"

type UserActionState = {
  message: string
  id?: string
  success: boolean
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await fetch(getUserApiUrl(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new APIError(
        `Failed to fetch users: ${response.statusText}`,
        response.status,
        getUserApiUrl()
      )
    }

    const users = await response.json()

    // Ensure bookmarkedPosts, followers, and following are always arrays
    return users.map((user: User) => ({
      ...user,
      bookmarkedPosts: user.bookmarkedPosts || [],
      followers: user.followers || [],
      following: user.following || [],
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export async function getUser(id: string): Promise<User | null> {
  try {
    const response = await fetch(getUserApiUrl(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new APIError(
        `Failed to fetch user: ${response.statusText}`,
        response.status,
        getUserApiUrl(id)
      )
    }

    const user = await response.json()
    return {
      ...user,
      bookmarkedPosts: user.bookmarkedPosts || [],
      followers: user.followers || [],
      following: user.following || [],
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

export async function getUsersByIds(ids: string[]): Promise<User[]> {
  try {
    const users = await Promise.all(ids.map((id) => getUser(id)))
    return users.filter((user) => user !== null) as User[]
  } catch (error) {
    console.error("Error fetching users by IDs:", error)
    throw error
  }
}

export async function createUserAction(
  prevState: UserActionState | void,
  formData: FormData
): Promise<UserActionState | void> {
  let createdId: string | undefined
  try {
    const name = formData.get("name")?.toString()
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()
    const avatar = formData.get("avatar")?.toString()

    if (!name || !email || !password) {
      return {
        message: "Name, email, and password are required",
        success: false,
      }
    }

    const createData: CreateUserData = {
      name,
      email,
      password,
      avatar: avatar || "",
      followers: [],
      following: [],
    }

    const response = await fetch(getUserApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createData),
    })

    if (!response.ok) {
      throw new APIError(
        `Failed to create user: ${response.statusText}`,
        response.status,
        getUserApiUrl()
      )
    }

    const createdUser = await response.json()
    revalidatePath("/user")
    createdId = createdUser.id

    // Set session cookie so user is logged in after signup
    const cookieStore = await cookies()
    cookieStore.set({
      name: "session",
      value: JSON.stringify(createdUser),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })
  } catch (error: unknown) {
    console.error("Error creating user:", error)
    return {
      message: isAPIError(error) ? error.message : "Failed to create user",
      success: false,
    }
  }
  if (createdId) {
    redirect(`/user/${createdId}`)
  }
}

export async function updateUserAction(
  prevState: UserActionState | void,
  formData: FormData
): Promise<UserActionState | void> {
  let updatedId: string | undefined
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to update a user")
    }

    const id = formData.get("id")?.toString()
    const name = formData.get("name")?.toString()
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()
    const avatar = formData.get("avatar")?.toString()

    if (!id) {
      return { message: "User ID is required", success: false }
    }

    // Check if user exists and user owns it
    const existingUser = await getUser(id)
    if (!existingUser) {
      throw new NotFoundError("User", id)
    }

    if (existingUser.id !== authUser.id) {
      throw new AuthenticationError("You can only update your own profile")
    }

    const updateData: UpdateUserData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password) updateData.password = password
    if (avatar !== undefined) updateData.avatar = avatar

    if (Object.keys(updateData).length === 0) {
      return { message: "No changes provided", success: false }
    }

    const response = await fetch(getUserApiUrl(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new APIError(
        `Failed to update user: ${response.statusText}`,
        response.status,
        getUserApiUrl(id)
      )
    }

    const updatedUser = await response.json()

    // Update session cookie with new user data to keep UI in sync
    const cookieStore = await cookies()
    const sessionData = {
      ...authUser,
      // Update with new values from the API response
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      // Only include password in session if it was actually updated
      ...(updateData.password && { password: updatedUser.password }),
    }

    cookieStore.set({
      name: "session",
      value: JSON.stringify(sessionData),
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    })

    revalidatePath(`/user/${id}`)
    updatedId = id
  } catch (error) {
    console.error("Error updating user:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to update user",
      success: false,
    }
  }
  if (updatedId) {
    redirect(`/user/${updatedId}`)
  }
}

export async function deleteUserAction(
  prevState: UserActionState | void,
  formData: FormData
): Promise<UserActionState | void> {
  try {
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to delete a user")
    }

    const id = formData.get("id")?.toString()
    if (!id) {
      return { message: "User ID is required", success: false }
    }

    // Check if user exists and user owns it
    const existingUser = await getUser(id)
    if (!existingUser) {
      throw new NotFoundError("User", id)
    }

    if (existingUser.id !== authUser.id) {
      throw new AuthenticationError("You can only delete your own account")
    }

    const response = await fetch(getUserApiUrl(id), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status === 404) {
      throw new NotFoundError("User", id)
    }

    if (!response.ok) {
      throw new APIError(
        `Failed to delete user: ${response.statusText}`,
        response.status,
        getUserApiUrl(id)
      )
    }

    // Clear session cookie to log out the user
    const cookieStore = await cookies()
    cookieStore.delete("session")

    revalidatePath("/user")
  } catch (error) {
    console.error("Error deleting user:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to delete user",
      success: false,
    }
  }

  // Redirect to user list page after successful deletion and logout
  redirect("/user")
}

// ==================================================
// FOLLOW FUNCTIONALITY - Phase 2: API Integration
// ==================================================

/**
 * Helper function to check if current user is following target user
 * Requires authentication to prevent unauthorized access
 */
export async function isFollowing(
  currentUserId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    // Authentication check - ensure user is logged in
    const authUser = await checkAuth()
    if (!authUser) {
      return false // Return false instead of throwing error for helper function
    }

    // Authorization check - user can only check their own follow status
    if (authUser.id !== currentUserId) {
      return false // Return false for unauthorized access
    }

    // Input validation
    if (!currentUserId || !targetUserId) {
      return false
    }

    if (currentUserId === targetUserId) {
      return false // Cannot follow yourself
    }

    const currentUser = await getUser(currentUserId)
    if (!currentUser) {
      return false
    }

    return currentUser.following?.includes(targetUserId) ?? false
  } catch (error) {
    console.error("Error checking follow status:", error)
    return false
  }
}

/**
 * Helper function to get followers count for a user
 * Public function - no authentication required for reading follower counts
 */
export async function getFollowersCount(userId: string): Promise<number> {
  try {
    // Input validation
    if (!userId) {
      return 0
    }

    const user = await getUser(userId)
    if (!user) {
      return 0
    }

    return user.followers?.length ?? 0
  } catch (error) {
    console.error("Error getting followers count:", error)
    return 0
  }
}

/**
 * Helper function to get following count for a user
 * Public function - no authentication required for reading following counts
 */
export async function getFollowingCount(userId: string): Promise<number> {
  try {
    // Input validation
    if (!userId) {
      return 0
    }

    const user = await getUser(userId)
    if (!user) {
      return 0
    }

    return user.following?.length ?? 0
  } catch (error) {
    console.error("Error getting following count:", error)
    return 0
  }
}

/**
 * Follow a user - performs dual entity updates with error rollback
 * Implements comprehensive authentication, authorization, and input validation
 */
export async function followUser(
  currentUserId: string,
  targetUserId: string
): Promise<UserActionState> {
  try {
    // Input validation - check for required parameters
    if (!currentUserId || !targetUserId) {
      return {
        message: "User IDs are required",
        success: false,
      }
    }

    // Validation - prevent self-follow
    if (currentUserId === targetUserId) {
      return {
        message: "You cannot follow yourself",
        success: false,
      }
    }

    // Authentication check - same pattern as other actions
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to follow users")
    }

    // Authorization check - ensure user can only follow for their own account
    if (authUser.id !== currentUserId) {
      throw new AuthenticationError(
        "You can only perform follow actions for your own account"
      )
    }

    // Get both users to validate they exist
    const [currentUser, targetUser] = await Promise.all([
      getUser(currentUserId),
      getUser(targetUserId),
    ])

    if (!currentUser) {
      throw new NotFoundError("Current user", currentUserId)
    }

    if (!targetUser) {
      throw new NotFoundError("Target user", targetUserId)
    }

    // Business logic validation - check if already following
    if (currentUser.following?.includes(targetUserId)) {
      return {
        message: "You are already following this user",
        success: false,
      }
    }

    // Prepare update data with safe array handling
    const updatedCurrentUserFollowing = [
      ...(currentUser.following || []),
      targetUserId,
    ]
    const updatedTargetUserFollowers = [
      ...(targetUser.followers || []),
      currentUserId,
    ]

    // Perform dual updates with comprehensive error handling and rollback
    let currentUserUpdated = false

    try {
      // Update current user's following list
      const currentUserResponse = await fetch(getUserApiUrl(currentUserId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentUser,
          following: updatedCurrentUserFollowing,
        }),
      })

      if (!currentUserResponse.ok) {
        throw new APIError(
          `Failed to update current user following: ${currentUserResponse.statusText}`,
          currentUserResponse.status,
          getUserApiUrl(currentUserId)
        )
      }

      currentUserUpdated = true

      // Update target user's followers list
      const targetUserResponse = await fetch(getUserApiUrl(targetUserId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...targetUser,
          followers: updatedTargetUserFollowers,
        }),
      })

      if (!targetUserResponse.ok) {
        throw new APIError(
          `Failed to update target user followers: ${targetUserResponse.statusText}`,
          targetUserResponse.status,
          getUserApiUrl(targetUserId)
        )
      }

      // Success - no revalidation to prevent page reloads in list views
      return {
        message: "Successfully followed user",
        success: true,
      }
    } catch (error) {
      // Rollback mechanism - if current user was updated but target user update failed
      if (currentUserUpdated) {
        try {
          await fetch(getUserApiUrl(currentUserId), {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...currentUser,
              following: currentUser.following || [],
            }),
          })
        } catch (rollbackError) {
          console.error(
            "Failed to rollback current user update:",
            rollbackError
          )
        }
      }
      throw error
    }
  } catch (error) {
    console.error("Error following user:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to follow user",
      success: false,
    }
  }
}

/**
 * Unfollow a user - performs dual entity updates with error rollback
 * Implements comprehensive authentication, authorization, and input validation
 */
export async function unfollowUser(
  currentUserId: string,
  targetUserId: string
): Promise<UserActionState> {
  try {
    // Input validation - check for required parameters
    if (!currentUserId || !targetUserId) {
      return {
        message: "User IDs are required",
        success: false,
      }
    }

    // Validation - prevent self-unfollow
    if (currentUserId === targetUserId) {
      return {
        message: "You cannot unfollow yourself",
        success: false,
      }
    }

    // Authentication check - same pattern as other actions
    const authUser = await checkAuth()
    if (!authUser) {
      throw new AuthenticationError("You must be logged in to unfollow users")
    }

    // Authorization check - ensure user can only unfollow for their own account
    if (authUser.id !== currentUserId) {
      throw new AuthenticationError(
        "You can only perform unfollow actions for your own account"
      )
    }

    // Get both users to validate they exist
    const [currentUser, targetUser] = await Promise.all([
      getUser(currentUserId),
      getUser(targetUserId),
    ])

    if (!currentUser) {
      throw new NotFoundError("Current user", currentUserId)
    }

    if (!targetUser) {
      throw new NotFoundError("Target user", targetUserId)
    }

    // Business logic validation - check if currently following
    if (!currentUser.following?.includes(targetUserId)) {
      return {
        message: "You are not following this user",
        success: false,
      }
    }

    // Prepare update data with safe array handling
    const updatedCurrentUserFollowing = (currentUser.following || []).filter(
      (id) => id !== targetUserId
    )
    const updatedTargetUserFollowers = (targetUser.followers || []).filter(
      (id) => id !== currentUserId
    )

    // Perform dual updates with comprehensive error handling and rollback
    let currentUserUpdated = false

    try {
      // Update current user's following list
      const currentUserResponse = await fetch(getUserApiUrl(currentUserId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...currentUser,
          following: updatedCurrentUserFollowing,
        }),
      })

      if (!currentUserResponse.ok) {
        throw new APIError(
          `Failed to update current user following: ${currentUserResponse.statusText}`,
          currentUserResponse.status,
          getUserApiUrl(currentUserId)
        )
      }

      currentUserUpdated = true

      // Update target user's followers list
      const targetUserResponse = await fetch(getUserApiUrl(targetUserId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...targetUser,
          followers: updatedTargetUserFollowers,
        }),
      })

      if (!targetUserResponse.ok) {
        throw new APIError(
          `Failed to update target user followers: ${targetUserResponse.statusText}`,
          targetUserResponse.status,
          getUserApiUrl(targetUserId)
        )
      }

      // Success - no revalidation to prevent page reloads in list views
      return {
        message: "Successfully unfollowed user",
        success: true,
      }
    } catch (error) {
      // Rollback mechanism - if current user was updated but target user update failed
      if (currentUserUpdated) {
        try {
          await fetch(getUserApiUrl(currentUserId), {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...currentUser,
              following: currentUser.following || [],
            }),
          })
        } catch (rollbackError) {
          console.error(
            "Failed to rollback current user update:",
            rollbackError
          )
        }
      }
      throw error
    }
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return {
      message:
        isAPIError(error) ||
        error instanceof AuthenticationError ||
        error instanceof NotFoundError
          ? error.message
          : "Failed to unfollow user",
      success: false,
    }
  }
}
