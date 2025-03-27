import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import UserPage from './page'

// Mock the UserList component to isolate the page logic
vi.mock('@/components/users/user-list', () => ({
  UserList: ({ users }: { users: any[] }) => (
    <div data-testid="user-list">
      {users.map((user) => (
        <div key={user.id} data-testid={`user-${user.id}`}>
          {user.name}
        </div>
      ))}
    </div>
  ),
}))

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
    const { findByTestId } = render(await UserPage())

    // Wait for the UserList component to be rendered with data
    const userList = await findByTestId('user-list')
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

    // UserList mock renders "No users found" when users array is empty
    // We need to adjust the mock or the assertion based on actual UserList implementation
    // For now, let's assume the mock UserList handles the empty case correctly
    // Or, we can check if the list container is empty or shows a specific message
    await waitFor(() => {
      // Depending on how UserList handles empty state, this might need adjustment
      // If UserList renders <p>No users found.</p>, we can check for that text.
      // Since we mocked UserList, let's check if the list container is present but empty
      const userList = screen.queryByTestId('user-list')
      expect(userList).toBeInTheDocument()
      expect(userList?.childElementCount).toBe(0)
      // If the actual UserList renders text: expect(screen.getByText('No users found.')).toBeInTheDocument();
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
      const userList = screen.queryByTestId('user-list')
      expect(userList).toBeInTheDocument()
      expect(userList?.childElementCount).toBe(0)
      // If the actual UserList renders text: expect(screen.getByText('No users found.')).toBeInTheDocument();
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
