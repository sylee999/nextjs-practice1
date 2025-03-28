import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UserPage from './page'

// Mock environment variable
const originalEnv = process.env

describe('UserPage', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, MOCKAPI_TOKEN: 'test-token' }
    global.fetch = vi.fn()
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('renders user list on successful fetch', async () => {
    const mockUsers = [
      {
        id: '1',
        name: 'Alice',
        createdAt: new Date().toISOString(),
        avatar: 'avatar1.png',
      },
      {
        id: '2',
        name: 'Bob',
        createdAt: new Date().toISOString(),
        avatar: 'avatar2.png',
      },
    ]

    // Mock fetch response
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    } as Response)

    // Render the component - Need to resolve the promise returned by the async component
    render(await UserPage())

    // Wait for the UserList component to be rendered with data
    const userList = await screen.findByTestId('user-list')
    expect(userList).toBeInTheDocument()

    // Check if users are rendered (based on the mock UserList)
    expect(await screen.findByTestId('user-1')).toHaveTextContent('Alice')
    expect(await screen.findByTestId('user-2')).toHaveTextContent('Bob')

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test-token.mockapi.io/api/v1/users',
      { cache: 'no-store' }
    )
  })

  it('renders "No users found" when fetch returns empty array', async () => {
    // Mock fetch response
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    render(await UserPage())

    // UserList renders "No users found" when users array is empty
    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument()
    })
  })

  it('handles fetch error gracefully', async () => {
    // Mock fetch to throw an error
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('API Error')
    )

    // Spy on console.error
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    render(await UserPage())

    // Expect console.error to have been called
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching users:',
        expect.any(Error)
      )
    })

    // Check that it renders the empty state (as per current error handling)
    await waitFor(() => {
      expect(screen.getByText('No users found.')).toBeInTheDocument()
    })

    consoleErrorSpy.mockRestore()
  })

  it('throws error if MOCKAPI_TOKEN is not set', async () => {
    delete process.env.MOCKAPI_TOKEN // Unset the token

    // We expect the component rendering to throw
    // Need to wrap the async component call properly to catch the error
    await expect(UserPage()).rejects.toThrow(
      'MOCKAPI_TOKEN is not defined in environment variables.'
    )
  })
})
