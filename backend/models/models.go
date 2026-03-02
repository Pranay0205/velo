package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	Name         string    `json:"name"`
	LastName     string    `json:"last_name"`
	Email        string    `json:"email" gorm:"uniqueIndex"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type Task struct {
	ID             uuid.UUID `json:"id"`
	UserID         uuid.UUID `json:"userID"`
	GoalID         uuid.UUID `json:"goal_id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	Deadline       time.Time `json:"deadline"`
	EstimatedHours *float64  `json:"estimated_hours" gorm:"default:null"`
	UserPriority   int       `json:"user_priority"` // 1-3: Low, Med, High
	AIUrgency      int       `json:"ai_urgency"`    // 1-10: Calculated engine pressure
	IsCompleted    bool      `json:"is_completed"`
	UpdatedAt      time.Time `json:"updated_at"`
	CreatedAt      time.Time `json:"created_at"`
}

func (u *Task) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type Goal struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey" json:"id"`
	UserID       uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	Title        string     `gorm:"not null" json:"title"`
	Description  string     `json:"description"`
	GoalType     string     `gorm:"column:goal_type;not null" json:"goal_type"`
	Status       string     `gorm:"not null;default:'active'" json:"status"`
	Deadline     *time.Time `json:"deadline"`
	Frequency    *int       `json:"frequency"`
	LastActiveAt *time.Time `json:"last_active_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

func (u *Goal) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

type ChatMessage struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	Message   string    `gorm:"not null" json:"message"`
	Role      string    `gorm:"not null" json:"role"` // "user" or "assistant"
	CreatedAt time.Time `json:"created_at"`
}

func (u *ChatMessage) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
