import dynamic from "next/dynamic";

const StateProjectsContent = dynamic(
  () => import("@/components/public/StateProjectsContent"),
  { 
    ssr: false,
    loading: () => (
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
        <div className="h-8 w-48 bg-slate-100 animate-pulse rounded-lg mb-8"></div>
        <div className="h-6 w-96 bg-slate-100 animate-pulse rounded-lg mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-border"></div>
          ))}
        </div>
      </div>
    )
  }
);

export default function StateProjectsPage() {
  return <StateProjectsContent />;
}
