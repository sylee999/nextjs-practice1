import { PostForm } from "@/components/post/post-form"

export default function CreatePostPage() {
  return (
    <div className="grid min-h-svh">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-2xl">
            <PostForm
              mode="create"
              initialData={{
                title: "",
                content: "",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
