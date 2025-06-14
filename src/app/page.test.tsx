import "@testing-library/jest-dom"

import { render, screen } from "@testing-library/react"

import Page from "./page"

describe("Page", () => {
  it("renders a heading", () => {
    render(<Page />)
    const text = screen.getByText("Home Page")
    expect(text).toBeInTheDocument()
  })
})
