export default function Loading() {
  return (
    <div className="min-h-screen bg-base p-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 w-3/4 bg-elevated rounded-lg" />
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 bg-elevated rounded" />
            <div className="h-32 bg-elevated rounded" />
            <div className="h-10 bg-elevated rounded" />
            <div className="h-10 bg-elevated rounded" />
            <div className="h-12 bg-cyan-accent/20 rounded mt-6" />
          </div>
          <div className="lg:col-span-3 space-y-3">
            <div className="h-8 w-1/2 bg-elevated rounded" />
            <div className="h-24 bg-elevated rounded" />
            <div className="h-24 bg-elevated rounded" />
            <div className="h-24 bg-elevated rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
