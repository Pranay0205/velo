import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router";

// Shared Layout Component
function Layout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      <nav className="p-4 border-b border-white/10 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-cyan-400">
          VELO
        </Link>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-cyan-400 transition-colors">
            Dashboard
          </Link>
          <Link to="/goals" className="hover:text-cyan-400 transition-colors">
            Goals
          </Link>
        </div>
      </nav>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-semibold mb-4">Daily Momentum</h2>
      <p className="text-neutral-400">Ready to tackle your Job Search goals today?</p>
      {/* TODO: Add Task List Component here */}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="goals" element={<div>Goals Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
