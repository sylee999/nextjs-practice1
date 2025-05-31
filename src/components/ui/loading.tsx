interface LoadingProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function Loading({
  message = "Loading...",
  size = "md",
}: LoadingProps): React.JSX.Element {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  )
}
