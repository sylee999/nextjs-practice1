import { Button } from '@/components/ui/button'
import UserList from '@/components/users/UserList'
import UserCreate from '@/components/users/UserCreate'
import UserEdit from '@/components/users/UserEdit'
import UserDelete from '@/components/users/UserDelete'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Button className="mt-4">Hello World</Button>
      <UserList />
      <UserCreate />
      <UserEdit userId="1" />
      <UserDelete userId="1" />
    </div>
  )
}
