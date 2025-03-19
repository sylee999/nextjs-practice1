import { render, screen } from '@testing-library/react'
import Page from './page'
import '@testing-library/jest-dom'

describe('Page', () => {
  it('renders a heading', () => {
    render(<Page />)
    const image = screen.getByAltText('Next.js logo')
    expect(image).toBeInTheDocument()
  })
})
