import { redirect } from "next/navigation"

import { checkAuth } from "@/app/auth/actions"
import { getUser } from "@/app/user/actions"
import { UserForm } from "@/components/user/user-form"

export default async function UserEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Check if user is authenticated
  const authUser = await checkAuth()
  if (!authUser) {
    redirect(`/login?from=/user/${id}/edit`)
  }

  // Get the user data
  const user = await getUser(id)
  if (!user) {
    redirect("/user")
  }

  // Check if the authenticated user can edit this profile
  if (authUser.id !== user.id) {
    redirect(`/user/${id}`)
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <UserForm
        mode="edit"
        initialData={{
          id: user.id,
          avatar: user.avatar,
          name: user.name,
          email: user.email,
          password: user.password || "",
        }}
      />
    </div>
  )
}
