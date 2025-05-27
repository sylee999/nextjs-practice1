"use client"

import { deleteUserAction } from "@/app/user/actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { User } from "@/types/user"
import { Trash2 } from "lucide-react"
import { useActionState } from "react"

export default function UserDeleteDialog({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(deleteUserAction, {
    message: "",
  })
  return (
    <form action={formAction} id="delete-form">
      <input type="hidden" name="id" value={user.id} />
      <Dialog>
        <DialogTrigger>
          <Button variant="destructive" className="flex items-center" asChild>
            <span>
              <Trash2 className="mr-2 size-4" />
              Delete Account
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
              {state.message && state.message !== "success" && (
                <Alert variant="destructive">
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                type="submit"
                form="delete-form"
                disabled={pending}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </form>
  )
}
