import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Sparkles, Check, X, Target, CheckSquare, Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import type { AIAction, Goal, Task } from "@/types";

type ActionReviewProps = {
  actions: AIAction[];
  onApproveAction?: (action: AIAction, index: number) => void;
  onRejectAction?: (action: AIAction, index: number) => void;
  onApproveAll?: (actions: AIAction[]) => void;
  onRejectAll?: (actions: AIAction[]) => void;
  isSubmitting?: boolean;
};

function getEntity(action: AIAction) {
  if (action.goal) return { kind: "Goal" as const, payload: action.goal };
  if (action.task) return { kind: "Task" as const, payload: action.task };
  return { kind: "Unknown" as const, payload: action };
}

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getVerb(type: string) {
  const [verb] = type.split("_");
  return verb || "update";
}

function getVerbConfig(verb: string) {
  switch (verb) {
    case "create":
      return { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", Icon: Plus };
    case "update":
      return { className: "bg-amber-500/10 text-amber-400 border-amber-500/20", Icon: Pencil };
    case "delete":
      return { className: "bg-rose-500/10 text-rose-400 border-rose-500/20", Icon: Trash2 };
    default:
      return { className: "bg-blue-500/10 text-blue-400 border-blue-500/20", Icon: Plus };
  }
}

function getEntityIcon(kind: string) {
  if (kind === "Goal") return Target;
  if (kind === "Task") return CheckSquare;
  return HelpCircle;
}

function priorityLabel(p?: number) {
  if (p === 3) return { label: "High", color: "text-rose-400" };
  if (p === 2) return { label: "Medium", color: "text-amber-400" };
  if (p === 1) return { label: "Low", color: "text-emerald-400" };
  return undefined;
}

export default function ActionReview({
  actions,
  onApproveAction,
  onRejectAction,
  onApproveAll,
  onRejectAll,
  isSubmitting = false,
}: ActionReviewProps) {
  return (
    <Card className="overflow-hidden border border-cyan-500/20 bg-zinc-950/80 shadow-2xl shadow-cyan-900/10 backdrop-blur-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

      <CardHeader className="relative border-b border-zinc-800/50 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-100">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              Proposed Changes
            </h2>
            <p className="text-xs text-zinc-400">Review AI suggestions before applying them to your workspace.</p>
          </div>

          {!!actions.length && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                disabled={isSubmitting}
                onClick={() => onRejectAll?.(actions)}
              >
                Reject All
              </Button>
              <Button
                size="sm"
                className="h-8 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white border-transparent transition-all shadow-sm"
                disabled={isSubmitting}
                onClick={() => onApproveAll?.(actions)}
              >
                Approve All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 pt-4">
        {!actions.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-8 text-zinc-500">
            <Sparkles className="mb-2 h-6 w-6 opacity-50" />
            <p className="text-sm">No pending actions to review.</p>
          </div>
        ) : (
          actions.map((action, i) => {
            const { kind, payload } = getEntity(action);
            const verb = getVerb(action.type);
            const { className: verbClass, Icon: VerbIcon } = getVerbConfig(verb);
            const EntityIcon = getEntityIcon(kind);

            const title =
              (payload as Goal | Task | AIAction).title || action.description || `${humanize(verb)} ${kind}`;

            const priority = priorityLabel((payload as Task).user_priority);

            return (
              <div
                key={`${action.type}-${i}`}
                className="group relative flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 transition-all hover:border-zinc-700 hover:bg-zinc-900/60"
              >
                <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide ${verbClass}`}
                    >
                      <VerbIcon className="h-3 w-3" />
                      {humanize(verb)}
                    </span>
                    <span className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
                      <EntityIcon className="h-3 w-3" />
                      {kind}
                    </span>
                    <h3 className="text-sm font-medium text-zinc-100 truncate flex-1">{title}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400">
                    {(payload as Goal | Task).description && (
                      <span className="truncate max-w-[200px] sm:max-w-[300px]">
                        {(payload as Goal | Task).description}
                      </span>
                    )}
                    {(payload as Goal).goal_type && (
                      <span className="flex items-center gap-1">
                        <span className="text-zinc-600">Type:</span>
                        <span className="text-zinc-300">{humanize((payload as Goal).goal_type!)}</span>
                      </span>
                    )}
                    {priority && (
                      <span className="flex items-center gap-1">
                        <span className="text-zinc-600">Priority:</span>
                        <span className={priority.color}>{priority.label}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-1.5 sm:mt-0 mt-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400"
                    disabled={isSubmitting}
                    onClick={() => onRejectAction?.(action, i)}
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-7 w-7 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    disabled={isSubmitting}
                    onClick={() => onApproveAction?.(action, i)}
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
