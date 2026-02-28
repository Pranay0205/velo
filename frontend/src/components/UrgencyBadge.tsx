import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
const urgencyColors: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/20", label: "Low" },
  2: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/25", label: "Low" },
  3: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", label: "Low" },
  4: { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/20", label: "Medium" },
  5: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/25", label: "Medium" },
  6: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", label: "Medium" },
  7: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/25", label: "High" },
  8: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", label: "High" },
  9: { bg: "bg-red-500/20", text: "text-red-400 animate-pulse", border: "border-red-500/30", label: "Critical" },
  10: { bg: "bg-red-500/25", text: "text-red-300 animate-pulse", border: "border-red-500/40", label: "Critical" },
};

export default function UrgencyBadge({
  urgency,
  className,
  ...props
}: React.ComponentProps<typeof Badge> & { urgency: number }) {
  const { bg, text, border, label } = urgencyColors[urgency] || urgencyColors[1];

  return (
    <Badge {...props} variant="outline" className={cn(bg, text, border, className)}>
      {label}
    </Badge>
  );
}
