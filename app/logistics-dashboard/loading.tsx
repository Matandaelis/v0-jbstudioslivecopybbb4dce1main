export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="h-20 bg-slate-200 animate-pulse" />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
