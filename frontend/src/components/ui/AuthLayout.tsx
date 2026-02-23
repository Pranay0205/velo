import { CheckCircle2, Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground lg:grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-md space-y-8">{children}</div>
      </div>

      <div className="relative hidden bg-zinc-950 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(0,245,255,0.05),transparent)] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2 text-white">
          <Zap className="h-5 w-5 fill-[#00f5ff] text-[#00f5ff]" />
          <span className="font-semibold tracking-wide">VELO ENGINE</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-5xl font-bold leading-tight tracking-tighter text-white">
            Own your time. <br />
            <span className="text-zinc-500">Master your goals.</span>
          </h2>
          <ul className="space-y-4">
            {["AI-driven task rebalancing", "Dynamic Focus vs. Recovery modes", "Zero-config behavioral tracking"].map(
              (text) => (
                <li key={text} className="flex items-center gap-3 text-zinc-400">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  {text}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-zinc-500">
          © 2026 Velo Systems Inc. Built for high-performance execution.
        </div>
      </div>
    </div>
  );
}
