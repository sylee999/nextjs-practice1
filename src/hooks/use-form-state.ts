import { useCallback, useState } from "react"

import type { FormMode } from "@/types/components"

/**
 * Generic form data interface
 */
interface FormData {
  [key: string]: string | undefined
  id?: string
}

/**
 * Hook for managing form state with change detection
 * Provides utilities for form data management and validation
 *
 * @param initialData - Initial form data
 * @param mode - Form mode ('create' or 'edit')
 * @returns Form state management utilities
 */
export function useFormState<T extends FormData>(
  initialData: T,
  mode: FormMode
) {
  const [formData, setFormData] = useState<T>(initialData)

  /**
   * Check if form data has changed from initial data
   * Always returns true for create mode, checks actual changes for edit mode
   */
  const hasChanges = useCallback((): boolean => {
    if (mode === "create") return true

    // In edit mode, check if any editable fields have changed
    return Object.keys(formData).some((key) => {
      // Skip id field as it's not editable
      if (key === "id") return false

      // For password fields, consider empty string as no change
      if (key === "password" && formData[key] === "") return false

      return formData[key] !== initialData[key]
    })
  }, [formData, initialData, mode])

  /**
   * Update a specific field in the form data
   */
  const updateField = useCallback((field: keyof T, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }, [])

  /**
   * Reset form to initial data
   */
  const resetForm = useCallback(() => {
    setFormData(initialData)
  }, [initialData])

  return {
    formData,
    setFormData,
    hasChanges,
    updateField,
    updateFields,
    resetForm,
  }
}
