import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import UrgencyBadge from "@/components/UrgencyBadge";
import type { Task, Goal } from "@/types";

const priorityOptions = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
];

export default function GoalTaskList({ goal }: { goal: Goal }) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { tasks, isLoading, completeTask, createTask } = useTasks(goal.id);

  const onCompleteTask = (taskId: string, isComplete: boolean) => {
    completeTask({ taskId, isComplete });
  };

  const onCreateTask = (title: string) => {
    createTask({ title, goal_id: goal.id });
    setNewTaskTitle("");
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-2">Tasks</h3>
      {isLoading ? (
        <p className="text-zinc-500 text-sm">Loading...</p>
      ) : tasks && tasks.length > 0 ? (
        tasks.map((task: Task) => (
          <div key={task.id} className="flex items-center justify-between gap-1 py-2">
            <div className="flex items-center gap-3">
              <Checkbox checked={task.is_completed} onClick={() => onCompleteTask(task.id, task.is_completed)} />
              <span className={task.is_completed ? "line-through text-zinc-600" : "text-white"}>{task.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {priorityOptions.find((option) => option.value === task.user_priority)?.label}
              </Badge>
              <UrgencyBadge urgency={task.ai_urgency} />
            </div>
          </div>
        ))
      ) : (
        <p className="text-zinc-600 text-sm">No tasks yet.</p>
      )}

      <div className="mt-3">
        <InputGroup>
          <InputGroupInput
            placeholder="Add a task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newTaskTitle.trim()) {
                onCreateTask(newTaskTitle.trim());
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            <ArrowUp
              className="cursor-pointer"
              onClick={() => {
                if (newTaskTitle.trim()) {
                  onCreateTask(newTaskTitle.trim());
                }
              }}
            />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
}
