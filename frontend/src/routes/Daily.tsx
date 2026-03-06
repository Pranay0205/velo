import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import UrgencyBadge from "@/components/UrgencyBadge";
import ChatPanel from "@/components/Chat/ChatPanel";
import { DiamondPlus, Trash2 } from "lucide-react";

export default function Daily() {
  // Get tasks for the selected goal
  const { tasks, isLoading: tasksLoading, completeTask, deleteTask } = useTasks();

  return (
    <div className="grid gap-4 space-y-6">
      <header className="flex items-end justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Today's Focus</h1>
          <p className="text-zinc-400 text-sm">Execute on your priorities for today.</p>
        </div>
        <Button
          size="sm"
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold h-9 px-4 shadow-lg shadow-cyan-500/20"
        >
          New Task
          <DiamondPlus className="ml-2 h-4 w-4" />
        </Button>
      </header>

      <div className="grid gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden shadow-2xl">
          {tasksLoading ? (
            <CardContent>
              <p className="text-zinc-500 text-sm p-4">Loading tasks...</p>
            </CardContent>
          ) : tasks.length > 0 ? (
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/50">
                {tasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="group relative overflow-hidden flex items-center bg-zinc-900/50 backdrop-blur-sm"
                  >
                    {/* Checkbox - Fixed Block */}
                    <div className="pl-4 z-20 shrink-0 bg-zinc-900/50 backdrop-blur-sm self-stretch flex items-center pr-2">
                      <Checkbox
                        checked={task.is_completed}
                        onClick={() => completeTask({ taskId: task.id, isComplete: task.is_completed })}
                        className="border-cyan-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-black"
                      />
                    </div>

                    {/* Task Content - Slides on hover */}
                    <div className="flex-1 flex items-center justify-between min-w-0 transition-transform duration-300 ease-out group-hover:-translate-x-12 pr-4 pl-1 py-3 z-10">
                      <div className="flex-1 min-w-0">
                        <span
                          className={`truncate block transition-all duration-300 ${task.is_completed ? "line-through text-zinc-600" : "text-zinc-100"}`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4 group-hover:opacity-0 transition-opacity duration-200">
                        <Badge
                          variant="outline"
                          className="border-zinc-800 bg-zinc-900/50 text-zinc-500 text-[10px] font-bold px-2 py-0.5 tracking-wider"
                        >
                          {task.user_priority === 3 ? "HIGH" : task.user_priority === 2 ? "MED" : "LOW"}
                        </Badge>
                        <UrgencyBadge className="text-[10px] font-bold px-2 py-0.5" urgency={task.ai_urgency} />
                      </div>
                    </div>

                    {/* Delete Action - Revealed by slide */}
                    <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 translate-x-12 group-hover:translate-x-0 transition-transform duration-300 ease-out">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTask(task.id)}
                        className="h-9 w-9 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-zinc-500 text-sm p-4 text-center">
                No tasks for today. Add some tasks to get started!
              </p>
            </CardContent>
          )}
        </Card>

        {/* Placeholder for Task list */}
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
}
