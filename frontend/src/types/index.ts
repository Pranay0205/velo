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
