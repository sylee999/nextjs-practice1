import { UserForm } from "@/components/user/user-form"

export default function SignUpPage() {
  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <UserForm
              mode="create"
              initialData={{
                avatar: "",
                name: "",
                email: "",
                password: "",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
