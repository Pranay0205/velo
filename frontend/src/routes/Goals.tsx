export default function Goals() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Strategic Goals</h1>
        <p className="text-zinc-400">Manage your long-term ambitions.</p>
      </header>

      <div className="grid gap-4">
        {/* TODO: Implement Goals hierarchy here */}
        <div className="p-12 border border-zinc-800 bg-zinc-900/30 rounded-xl">
          <p className="text-zinc-500 italic text-center">Your long-term vision starts here.</p>
        </div>
      </div>
    </div>
  );
}
