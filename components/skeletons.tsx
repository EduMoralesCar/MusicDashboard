import { cn } from "@/lib/utils"

export function SkeletonCard({ circle = false }: { circle?: boolean }) {
  return (
    <div className="animate-pulse rounded-lg bg-card p-4">
      <div className={cn("aspect-square w-full bg-muted", circle ? "rounded-full" : "rounded-md")} />
      <div className="mt-4 h-3 w-3/4 rounded bg-muted" />
      <div className="mt-2 h-3 w-1/2 rounded bg-muted" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="grid grid-cols-[16px_4fr_3fr_2fr_60px] items-center gap-4 px-4 py-2">
      <div className="h-3 w-3 rounded bg-muted" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded bg-muted" />
        <div className="flex-1">
          <div className="h-3 w-1/2 rounded bg-muted" />
          <div className="mt-1.5 h-2 w-1/3 rounded bg-muted" />
        </div>
      </div>
      <div className="hidden h-3 w-1/2 rounded bg-muted md:block" />
      <div className="hidden h-3 w-1/3 rounded bg-muted md:block" />
      <div className="h-3 w-8 justify-self-end rounded bg-muted" />
    </div>
  )
}
