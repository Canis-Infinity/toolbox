import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 border-b pb-8">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-5 w-full max-w-3xl" />
        <div className="flex gap-2"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-36" /></div>
      </div>
      <CardGridSkeleton count={8} />
    </div>
  );
}

export function ToolListSkeleton() {
  return <div className="grid gap-4"><Skeleton className="h-9 w-40" /><CardGridSkeleton count={10} /></div>;
}

export function CategorySkeleton() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-2"><Skeleton className="h-9 w-52" /><Skeleton className="h-5 w-full max-w-xl" /></div>
      <CardGridSkeleton count={6} />
    </div>
  );
}

export function ToolWorkbenchSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2 border-b pb-5"><Skeleton className="h-9 w-64" /><Skeleton className="h-5 w-full max-w-2xl" /></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-3"><Skeleton className="h-5 w-16" /><Skeleton className="h-80 w-full" /><Skeleton className="h-9 w-72" /></div>
        <Skeleton className="min-h-80 w-full" />
      </div>
    </div>
  );
}

function CardGridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }, (_, index) => (
        <Card size="sm" key={index}>
          <CardHeader><Skeleton className="h-5 w-2/5" /><Skeleton className="h-4 w-4/5" /></CardHeader>
        </Card>
      ))}
    </div>
  );
}
