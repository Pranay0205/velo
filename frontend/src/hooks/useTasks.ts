import { logger } from "@/lib/logger";
import type { Task } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useTasks(goalId?: string) {
  const queryClient = useQueryClient();

  const queryKey = goalId ? ["tasks", goalId] : ["tasks"];

  const { data: tasks, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const url = goalId ? `/api/tasks?goal_id=${goalId}` : "/api/tasks";
      logger.log(`[useTasks] Fetching tasks${goalId ? ` for goal: ${goalId}` : ""} from ${url}`);

      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        logger.error(`[useTasks] Failed to fetch tasks. Status: ${response.status}`);
        throw new Error("Failed to fetch tasks");
      }

      const result = await response.json();
      logger.log(`[useTasks] Fetched ${result.data?.length ?? 0} tasks successfully`);
      return result.data;
    },
    enabled: goalId ? !!goalId : true,
  });

  const { mutate: completeTask } = useMutation({
    mutationFn: async ({ taskId, isComplete }: { taskId: string; isComplete: boolean }) => {
      const newState = !isComplete;
      logger.log(
        `[useTasks] Toggling task completion: ${taskId}, ${isComplete ? "complete" : "incomplete"} → ${newState ? "complete" : "incomplete"}`,
      );

      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_completed: newState }),
      });

      if (!response.ok) {
        logger.error(`[useTasks] Failed to update task ${taskId}. Status: ${response.status}`);
        throw new Error("Failed to update task");
      }

      logger.log(`[useTasks] Task ${taskId} successfully updated to ${newState ? "complete" : "incomplete"}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Task updated!");
    },
  });

  // Create new task
  const { mutate: createTask } = useMutation({
    mutationFn: async ({ title, goal_id }: { title: string; goal_id: string }) => {
      logger.log(`[useTasks] Creating task: "${title}" for goal: ${goal_id}`);

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, goal_id, user_priority: 2 }),
      });

      if (!response.ok) {
        logger.error(`[useTasks] Failed to create task. Status: ${response.status}`);
        throw new Error("Failed to create task");
      }

      const result = await response.json();
      logger.log(`[useTasks] Task created successfully:`, result.data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Task created!");
    },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: async (taskId: string) => {
      logger.log(`[useTasks] Deleting task: ${taskId}`);

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        logger.error(`[useTasks] Failed to delete task ${taskId}. Status: ${response.status}`);
        throw new Error("Failed to delete task");
      }

      logger.log(`[useTasks] Task ${taskId} deleted successfully`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Task deleted.");
    },
  });

  const sortedTasks = [...(tasks ?? [])].sort((a: Task, b: Task) => {
    if (a.is_completed !== b.is_completed) return Number(a.is_completed) - Number(b.is_completed);
    return b.user_priority - a.user_priority; // higher priority first
  });

  logger.log(
    `[useTasks] Sorted ${sortedTasks.length} tasks (${sortedTasks.filter((t: Task) => !t.is_completed).length} incomplete, ${sortedTasks.filter((t: Task) => t.is_completed).length} completed)`,
  );

  return { tasks: sortedTasks, isLoading, completeTask, createTask, deleteTask };
}
