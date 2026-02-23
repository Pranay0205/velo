import { useAuth } from "@/context/useAuth";
import { Link, Outlet } from "react-router";

export default function Layout() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const layout = (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-cyan-500/30">
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold tracking-tighter cursor-pointer text-cyan-400">
              VELO
            </Link>
            <div className="flex gap-4 text-sm font-medium text-zinc-400">
              <Link to="/" className="hover:text-white transition-colors">
                Daily
              </Link>
              <Link to="/goals" className="hover:text-white transition-colors">
                Goals
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Status Indicator (Focused/Lost/Burnt Out) will go here */}
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Focused</span>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl py-4">Hello, {user?.name}!</h1>
        <Outlet />
      </main>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : !isAuthenticated ? (
        <div className="flex items-center justify-center h-screen">
          <p className="text-zinc-500">Please log in to access your dashboard.</p>
        </div>
      ) : (
        layout
      )}
      )
    </>
  );
}
