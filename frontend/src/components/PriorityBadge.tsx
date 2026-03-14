import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityConfig: Record<number, { bg: string; text: string; border: string; label: string }> = {
  1: { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/20", label: "Low" },
  2: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/20", label: "Med" },
  3: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/25", label: "High" },
};

export default function PriorityBadge({ priority, className }: { priority: number; className?: string }) {
  const config = priorityConfig[priority] ?? priorityConfig[1];

  return (
    <Badge
      variant="outline"
      className={cn(config.bg, config.text, config.border, "font-bold tracking-wider", className)}
    >
      {config.label}
    </Badge>
  );
}
