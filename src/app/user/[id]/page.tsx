interface UserDetailPageProps {
  params: { id: string }
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  return (
    <div>
      <h1>User Detail Page</h1>
      <p>User ID: {params.id}</p>
      {/* TODO: Fetch and display user details */}
    </div>
  )
}
