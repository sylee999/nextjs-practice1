import { UserList } from '@/components/users/user-list'

interface User {
  id: string
  createdAt: string
  name: string
  avatar: string
}

async function getUsers(): Promise<User[]> {
  const apiToken = process.env.MOCKAPI_TOKEN
  if (!apiToken) {
    throw new Error('MOCKAPI_TOKEN is not defined in environment variables.')
  }
  const url = `https://${apiToken}.mockapi.io/api/v1/users`

  try {
    // Using Next.js extended fetch for caching/revalidation control
    // Default is cache: 'force-cache', good for static data
    // Use { cache: 'no-store' } for dynamic data on every request
    // Use { next: { revalidate: seconds } } for ISR
    const res = await fetch(url, { cache: 'no-store' }) // Fetch fresh data on each request

    if (!res.ok) {
      throw new Error(`Failed to fetch users: ${res.status} ${res.statusText}`)
    }
    const users = await res.json()
    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    // In a real app, you might want to show a user-friendly error message
    // For now, we'll return an empty array or re-throw to be caught by an error boundary
    return [] // Return empty array on error to avoid breaking the page
  }
}

export default async function UserPage() {
  const users = await getUsers()

  return <UserList users={users} />
}
