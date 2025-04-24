export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Use Promise.resolve to ensure params.id is awaited
  const userId = await Promise.resolve(params.id)

  return (
    <div>
      <h1>User Detail Page</h1>
      <p>User ID: {userId}</p>
      {/* TODO: Fetch and display user details */}
    </div>
  )
}
