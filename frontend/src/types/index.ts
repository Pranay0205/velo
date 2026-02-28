export type Goal = {
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
  total_tasks: number;
  completed_tasks: number;
};

export type Task = {
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
