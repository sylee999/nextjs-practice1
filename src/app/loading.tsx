import { Skeleton } from "@/components/ui/skeleton"

export default function LandingLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 p-4 py-12">
      {/* Hero Section Skeleton */}
      <section className="space-y-6 text-center">
        <Skeleton className="mx-auto h-12 w-96" />
        <Skeleton className="mx-auto h-6 w-full max-w-2xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Skeleton className="h-11 w-[200px]" />
          <Skeleton className="h-11 w-[200px]" />
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="space-y-8">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-8 w-80" />
          <Skeleton className="mx-auto h-4 w-96" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border p-6">
              <Skeleton className="mb-4 h-12 w-12 rounded-lg" />
              <Skeleton className="mb-2 h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-4/5" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section Skeleton */}
      <section className="bg-muted/50 space-y-6 rounded-lg p-8 text-center">
        <Skeleton className="mx-auto h-8 w-60" />
        <Skeleton className="mx-auto h-4 w-full max-w-xl" />
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Skeleton className="h-11 w-40" />
          <Skeleton className="h-11 w-40" />
        </div>
      </section>
    </div>
  )
}
