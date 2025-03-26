interface PostDetailPageProps {
  params: { id: string }
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  return (
    <div>
      <h1>Post Detail Page</h1>
      <p>Post ID: {params.id}</p>
      {/* TODO: Fetch and display post details */}
    </div>
  )
}
