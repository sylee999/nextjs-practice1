export default async function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = await params

  return (
    <div>
      <h1>User Detail Page</h1>
      <p>User ID: {id}</p>
      {/* TODO: Fetch and display user details */}
    </div>
  )
}
