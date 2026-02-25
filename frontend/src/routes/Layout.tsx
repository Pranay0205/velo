import { useAuth } from "@/context/useAuth";
import { Link, Outlet } from "react-router";

export default function Layout() {
  const { user } = useAuth();
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
            <span className="text-xs text-zinc-500 tracking-widest">
              <h1 className="text-2xl py-4">Hello, {user?.name}!</h1>
            </span>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );

  return <>{layout}</>;
}
