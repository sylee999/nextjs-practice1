import Link from "next/link"
import { Home, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function HomeNotFound() {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <Card className="text-center">
        <CardHeader>
          <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription className="text-base">
            We couldn&apos;t find the page you&apos;re looking for in the home
            section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            The page might have been moved, deleted, or you may have mistyped
            the URL.
          </p>

          <div className="pt-4">
            <p className="mb-3 text-sm font-medium">
              Here are some helpful links:
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link href="/home">
                <Button variant="outline" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Home Feed
                </Button>
              </Link>
              <Link href="/user">
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Browse Users
                </Button>
              </Link>
              <Link href="/post">
                <Button variant="outline" className="w-full">
                  <Search className="mr-2 h-4 w-4" />
                  All Posts
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/" className="mx-auto">
            <Button variant="ghost">Back to Landing Page</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
