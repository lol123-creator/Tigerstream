export default function MovieWatchLoading() {
  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-white/10" />
        <div className="aspect-video w-full animate-pulse rounded-xl bg-white/5" />
      </div>
    </div>
  );
}
