import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/types";
import { useTasks } from "@/hooks/useTasks";
export default function Daily() {
  // Get tasks for the selected goal
  const { tasks, isLoading: tasksLoading, completeTask } = useTasks();

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Today's Focus</h1>
          <p className="text-zinc-400 text-sm">Execute on your priorities for today.</p>
        </div>
        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold">
          New Task
        </Button>
      </header>

      <div className="grid gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
          {tasksLoading ? (
            <CardContent>
              <p className="text-zinc-500 text-sm">Loading tasks...</p>
            </CardContent>
          ) : tasks.length > 0 ? (
            <CardContent className="space-y-4">
              {tasks.map((task: Task) => (
                <div key={task.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.is_completed}
                      onClick={() => completeTask({ taskId: task.id, isComplete: task.is_completed })}
                      className="border-cyan-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-black"
                    />
                    <span className={task.is_completed ? "line-through text-zinc-600" : "text-white"}>
                      {task.title}
                    </span>
                  </div>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px] px-2 py-0">
                    {task.user_priority === 3 ? "HIGH" : task.user_priority === 2 ? "MED" : "LOW"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          ) : (
            <CardContent>
              <p className="text-zinc-500 text-sm">No tasks for today. Add some tasks to get started!</p>
            </CardContent>
          )}
        </Card>

        {/* Placeholder for Task list */}
        <div className="p-8 border border-dashed border-zinc-900 rounded-xl flex flex-col items-center justify-center text-zinc-600 bg-zinc-950/50">
          <p className="text-sm">More tasks will appear here.</p>
        </div>
      </div>
    </div>
  );
}
