import React from "react"

export async function Footer() {
  return (
    <footer className="bg-background fixed bottom-0 left-0 z-50 flex w-full items-center border-t">
      <div className="container-wrapper w-full">
        <div className="container py-4">
          <div className="text-muted-foreground text-center text-sm leading-loose text-balance">
            Built by{" "}
            <a
              href="https://github.com/sylee999"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              sylee999
            </a>
            . The source code is available on{" "}
            <a
              href="https://github.com/sylee999/nextjs-practice1"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </div>
        </div>
      </div>
    </footer>
  )
}
