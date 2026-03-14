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
  ai_urgency: number; // 1-10, calculated by backend
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type AIAction = {
  type: string;
  goal?: {
    title: string;
    description: string;
    goal_type: string;
    deadline?: string | null;
  };
  task?: {
    title: string;
    goal_index?: number;
    existing_goal_id?: string;
    user_priority: number;
  };
  update_goal?: {
    goal_id: string;
    title?: string;
    description?: string;
    goal_type?: string;
    status?: string;
    deadline?: string | null;
    frequency?: number;
  };
  delete_goal?: {
    goal_id: string;
  };
  update_task?: {
    task_id: string;
    title?: string;
    description?: string;
    deadline?: string | null;
    user_priority?: number;
    completed?: boolean;
  };
  delete_task?: {
    task_id: string;
  };
  reprioritize?: {
    task_id: string;
    new_priority: number;
    reason: string;
  };
};

export type ChatMessage = {
  id: string;
  user_id: string;
  message: string;
  role: "user" | "assistant";
  created_at: string;
};

export type ChatResponse = {
  message: string;
  actions: AIAction[];
};
