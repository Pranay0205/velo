package llm

import "time"

type GoalAction struct {
	Title       string     `json:"title"`
	Description string     `json:"description"`
	GoalType    string     `json:"goal_type"`
	Deadline    *time.Time `json:"deadline,omitempty"`
}

type TaskAction struct {
	Title          string  `json:"title"`
	GoalIndex      *int    `json:"goal_index,omitempty"`
	ExistingGoalID *string `json:"existing_goal_id,omitempty"`
	UserPriority   int     `json:"user_priority"`
}

type ReprioritizeAction struct {
	TaskID      string `json:"task_id"`
	NewPriority int    `json:"new_priority"`
	Reason      string `json:"reason"`
}

type Action struct {
	Type             string              `json:"type"`
	Goal             *GoalAction         `json:"goal,omitempty"`
	Task             *TaskAction         `json:"task,omitempty"`
	ReprioritizeTask *ReprioritizeAction `json:"reprioritize,omitempty"`
	UpdateTaskAction *UpdateTaskAction   `json:"update_task,omitempty"`
	DeleteTaskAction *DeleteTaskAction   `json:"delete_task,omitempty"`
	UpdateGoalAction *UpdateGoalAction   `json:"update_goal,omitempty"`
	DeleteGoalAction *DeleteGoalAction   `json:"delete_goal,omitempty"`
}

type LLMResponse struct {
	Message string   `json:"message"`
	Actions []Action `json:"actions"`
}

type UpdateGoalAction struct {
	GoalID      string     `json:"goal_id"`
	Title       *string    `json:"title,omitempty"`
	Description *string    `json:"description,omitempty"`
	GoalType    *string    `json:"goal_type,omitempty"`
	Status      *string    `json:"status,omitempty"`
	Deadline    *time.Time `json:"deadline,omitempty"`
	Frequency   *int       `json:"frequency,omitempty"`
}

type UpdateTaskAction struct {
	TaskID         string     `json:"task_id"`
	Title          *string    `json:"title,omitempty"`
	Description    *string    `json:"description,omitempty"`
	Deadline       *time.Time `json:"deadline,omitempty"`
	UserPriority   *int       `json:"user_priority,omitempty"`
	Completed      *bool      `json:"completed,omitempty"`
	GoalIndex      *int       `json:"goal_index,omitempty"`
	ExistingGoalID *string    `json:"existing_goal_id,omitempty"`
}

type DeleteGoalAction struct {
	GoalID string `json:"goal_id"`
}

type DeleteTaskAction struct {
	TaskID string `json:"task_id"`
}
