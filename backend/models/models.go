package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	LastName     string    `json:"last_name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Task struct {
	ID           uuid.UUID `json:"id"`
	User         uuid.UUID `json:"userID"`
	GoalID       uuid.UUID `json:"goal_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Deadline     time.Time `json:"deadline"`
	UserPriority int       `json:"user_priority"` // 1-3: Low, Med, High
	AIUrgency    int       `json:"ai_urgency"`    // 1-10: Calculated engine pressure
	IsCompleted  bool      `json:"is_completed"`
	UpdatedAt    time.Time `json:"updated_at"`
	CreatedAt    time.Time `json:"created_at"`
}

type Goal struct {
	ID                 uuid.UUID `json:"id"`
	User               uuid.UUID `json:"userID"`
	Title              string    `json:"title"`
	Description        string    `json:"description"`
	Deadline           time.Time `json:"deadline"`
	IsRecurring        bool      `json:"is_recurring"`
	RecurrenceInterval string    `json:"recurrence_interval,omitempty"` // "daily", "weekly"
	TargetMetric       int       `json:"target_metric"`                 // e.g. 100% or 50 tasks
	CurrentMetric      int       `json:"current_metric"`
	UpdatedAt          time.Time `json:"updated_at"`
	CreatedAt          time.Time `json:"created_at"`
}
