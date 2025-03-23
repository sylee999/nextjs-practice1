import React from 'react'

interface MainProps {
  children: React.ReactNode
}

const Main: React.FC<MainProps> = ({ children }) => {
  return <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
}

export default Main
