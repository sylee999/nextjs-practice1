import { useEffect } from "react"
import { useRouter } from "next/navigation"

import type { FormMode, FormState, FormStateWithId } from "@/types/components"

/**
 * Hook for managing form navigation and success redirects
 * Handles different navigation patterns based on form mode and state
 *
 * @param state - Form action state
 * @param mode - Form mode ('create' or 'edit')
 * @param entityId - Entity ID for edit mode navigation
 * @param entityType - Type of entity ('user' or 'post') for URL construction
 */
export function useFormNavigation(
  state: FormState | FormStateWithId,
  mode: FormMode,
  entityId?: string,
  entityType: "user" | "post" = "user"
): void {
  const router = useRouter()

  useEffect(() => {
    if (state.success === true) {
      router.refresh()

      if (mode === "create" && "id" in state && state.id) {
        // Navigate to the newly created entity
        router.push(`/${entityType}/${state.id}`)
      } else if (mode === "edit" && entityId) {
        // Navigate back to the entity detail page
        router.push(`/${entityType}/${entityId}`)
      } else {
        // Fallback navigation
        router.push(`/${entityType}`)
      }
    }
  }, [state, router, mode, entityId, entityType])
}

/**
 * Hook for handling form cancellation navigation
 * Provides consistent cancel behavior across form components
 *
 * @param mode - Form mode ('create' or 'edit')
 * @param entityId - Entity ID for edit mode navigation
 * @param entityType - Type of entity ('user' or 'post') for URL construction
 * @returns Cancel handler function
 */
export function useFormCancelNavigation(
  mode: FormMode,
  entityId?: string,
  entityType: "user" | "post" = "user"
): () => void {
  const router = useRouter()

  return () => {
    if (mode === "edit" && entityId) {
      router.push(`/${entityType}/${entityId}`)
    } else {
      router.push(`/${entityType}`)
    }
  }
}
