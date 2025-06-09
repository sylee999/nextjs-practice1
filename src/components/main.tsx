import React from "react"

interface MainProps {
  children: React.ReactNode
}

export function Main({ children }: MainProps): React.JSX.Element {
  return <main className="p-4">{children}</main>
}
