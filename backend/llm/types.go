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
	Type         string              `json:"type"`
	Goal         *GoalAction         `json:"goal,omitempty"`
	Task         *TaskAction         `json:"task,omitempty"`
	Reprioritize *ReprioritizeAction `json:"reprioritize,omitempty"`
}

type LLMResponse struct {
	Message string   `json:"message"`
	Actions []Action `json:"actions"`
}
