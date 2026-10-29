export default function Loading() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-cyan-accent/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-cyan-accent border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-cyan-accent">Loading OptiNova...</p>
      </div>
    </div>
  );
}
