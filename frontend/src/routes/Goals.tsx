import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logger } from "@/lib/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { toast } from "sonner";
import z from "zod";

type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  goal_type: "deadline" | "habit" | "exploration";
  status: "not_started" | "in_progress" | "completed" | "abandoned";
  deadline: string | null;
  frequency: number | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
};

type Task = {
  id: string;
  goal_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  user_priority: number; // 1-3: Low, Med, High
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

const goalFormScheme = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  goal_type: z.enum(["deadline", "habit", "exploration"]),
  deadline: z.string().optional(),
  frequency: z.number().optional(),
});

type GoalForm = z.infer<typeof goalFormScheme>;

const typeOptions = [
  { value: "deadline", label: "Deadline" },
  { value: "habit", label: "Habit" },
  { value: "exploration", label: "Exploration" },
];

const priorityOptions = [
  { value: 1, label: "Low", className: "bg-green-50 dark:bg-green-800" },
  { value: 2, label: "Medium", className: "bg-green-50 dark:bg-green-800" },
  { value: 3, label: "High", className: "bg-green-50 dark:bg-green-800" },
];

export default function Goals() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const form = useForm<GoalForm>({
    resolver: zodResolver(goalFormScheme),
    defaultValues: {
      title: "",
      description: "",
      goal_type: "deadline",
    },
  });

  const goalType = form.watch("goal_type");

  // Get goals for the logged in user
  const { data: goals, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const response = await fetch("/api/goals", {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("Failed to fetch goals:", errorData);
        return null;
      }

      const result = await response.json();
      logger.log("Fetched goals:", result);
      return result.data;
    },
    retry: false,
  });

  // Get tasks for the selected goal
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", selectedGoal?.id],
    queryFn: async () => {
      if (!selectedGoal) return null;

      const response = await fetch(`/api/tasks?goal_id=${selectedGoal.id}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("Failed to fetch tasks:", errorData);
        return null;
      }

      const result = await response.json();
      logger.log("Fetched tasks:", result);
      return result.data;
    },
    enabled: !!selectedGoal,
  });

  // Complete Task
  const { mutate: completeTask } = useMutation({
    mutationFn: async ({ taskId, isComplete }: { taskId: string; isComplete: boolean }) => {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({ is_completed: !isComplete }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("Failed to complete task:", errorData);
        throw new Error(errorData.error || "Failed to complete task");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", selectedGoal?.id] });
      toast.success("Task marked as completed!");
    },
    onError: (error: Error) => {
      logger.error("Error completing task:", error);
      toast.error("Failed to complete task. Please try again later.");
    },
  });

  // Create new goal
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GoalForm) => {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("Failed to create goal:", errorData);
        throw new Error(errorData.error || "Failed to create goal");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data: Goal) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      logger.log("Created goal:", data);
      toast.success("Goal created!");
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      logger.error("Error fetching goals:", error);
      toast.error("Failed to create goals. Please try again later.");
    },
  });

  // Create new task
  const { mutate: createTask } = useMutation({
    mutationFn: async (data: { title: string; goal_id?: string; user_priority: number }) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("Failed to create task:", errorData);
        throw new Error(errorData.error || "Failed to create task");
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data: Task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", selectedGoal?.id] });
      logger.log("Created task:", data);
      toast.success("Task created!");
      setNewTaskTitle("");
    },
    onError: (error: Error) => {
      logger.error("Error creating task:", error);
      toast.error("Failed to create task. Please try again later.");
    },
  });

  // Delete goal
  const { mutate: deleteGoal } = useMutation({
    mutationFn: async (goalId: string) => {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal deleted.");
    },
  });

  const onSubmit = (data: GoalForm) => {
    const payload = {
      title: data.title,
      description: data.description,
      goal_type: data.goal_type,
      ...(data.goal_type === "deadline" &&
        data.deadline && {
          deadline: data.deadline + "T00:00:00Z",
        }),
      ...(data.goal_type === "habit" &&
        data.frequency && {
          frequency: data.frequency,
        }),
    };
    mutate(payload);
  };

  const onCompleteTask = (taskId: string, isComplete: boolean) => {
    completeTask({ taskId, isComplete });
  };

  const onCreateTask = (title: string) => {
    if (selectedGoal) {
      createTask({ title, goal_id: selectedGoal.id, user_priority: 2 });
    }
  };

  const sortedTasks = [...(tasks ?? [])].sort((a: Task, b: Task) => {
    if (a.is_completed !== b.is_completed) return Number(a.is_completed) - Number(b.is_completed);
    return b.user_priority - a.user_priority; // higher priority first
  });

  const newGoalPopup = (
    <Dialog open={open} onOpenChange={setOpen}>
      <Form {...form}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2" variant="outline">
            <Plus className="ml-2 h-4 w-4" />
            <span className="text-sm">New Goal</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-full  bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium">Create New Goal</DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Set a new goal to stay focused and motivated.
            </DialogDescription>
          </DialogHeader>

          <form id="form-new-goal" className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      placeholder="e.g. Get a job by June"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="w-full rounded-md border border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      placeholder="e.g. I want to get a job by June so that I can start my career and gain experience in the industry."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {goalType === "deadline" && (
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {goalType === "habit" && (
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency (times per week)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={7}
                        placeholder="e.g. 4"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button className="mt-6" type="submit" variant="outline">
              {isPending ? "Creating Goal..." : "Create Goal"}
            </Button>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4">Your Goals</h1>
        <div>{newGoalPopup}</div>
      </div>
      {isLoading ? (
        <p>Loading goals...</p>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal: Goal) => (
            <Card key={goal.id} onClick={() => setSelectedGoal(goal)} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row justify-between items-start">
                <h2 className="text-white font-medium">{goal.title}</h2>
                <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 text-sm">{goal.description}</p>
              </CardContent>
              <CardFooter className="flex gap-2 mt-2">
                <Badge variant="outline">{goal.goal_type}</Badge>
                <Badge variant="outline">{goal.status}</Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p>No goals found. Start by creating a new goal!</p>
      )}

      <Dialog open={!!selectedGoal} onOpenChange={(open) => !open && setSelectedGoal(null)}>
        <DialogContent className="text-white bg-zinc-900 border-zinc-800 w-full">
          <DialogHeader>
            <DialogTitle>{selectedGoal?.title}</DialogTitle>
            <DialogDescription className="text-sm text-zinc-400">{selectedGoal?.description}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-4 text-white">
            <div>
              <span className="text-zinc-500 text-sm">Type:</span>{" "}
              <Badge variant="outline">{selectedGoal?.goal_type}</Badge>
            </div>
            <div>
              <span className="text-zinc-500 text-sm">Status:</span>{" "}
              <Badge variant="outline">{selectedGoal?.status}</Badge>
            </div>
            {selectedGoal?.deadline && (
              <div>
                <span className="text-zinc-500 text-sm">Deadline:</span>{" "}
                {new Date(selectedGoal.deadline).toLocaleDateString()}
              </div>
            )}
            {selectedGoal?.frequency && (
              <div>
                <span className="text-zinc-500 text-sm">Frequency:</span> {selectedGoal.frequency} times/week
              </div>
            )}

            {/* TODO: Task list here */}

            <div className="mt-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Tasks</h3>
              {tasksLoading ? (
                <p className="text-zinc-500 text-sm">Loading...</p>
              ) : sortedTasks && sortedTasks.length > 0 ? (
                sortedTasks.map((task: Task) => (
                  <div key={task.id} className="flex items-center gap-2 py-2">
                    <Checkbox checked={task.is_completed} onClick={() => onCompleteTask(task.id, task.is_completed)} />
                    <span className={task.is_completed ? "line-through text-zinc-600" : "text-white"}>
                      {task.title}
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      {priorityOptions.find((option) => option.value === task.user_priority)?.label}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-zinc-600 text-sm">No tasks yet.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <div className="w-full">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
