package engine

import (
	"testing"
	"time"

	"github.com/Pranay0205/velo/backend/models"
	"github.com/google/uuid"
)

func timePtr(t time.Time) *time.Time {
	return &t
}

func TestCalculateUrgency(t *testing.T) {
	tests := []struct {
		name           string
		task           models.Task
		goal           models.Goal
		totalTasks     int
		completedTasks int
		wantMin        int
		wantMax        int
	}{
		{
			name: "Low priority, no deadline, goal barely started",
			task: models.Task{
				UserPriority: 1,
				CreatedAt:    time.Now().AddDate(0, 0, -7),
				UpdatedAt:    time.Now(),
			},
			goal: models.Goal{
				CreatedAt: time.Now().AddDate(0, 0, -7),
			},
			totalTasks:     10,
			completedTasks: 1,
			wantMin:        1,
			wantMax:        2,
		},
		{
			name: "High priority, deadline in 3 days, goal half done",
			task: models.Task{
				UserPriority: 3,
				Deadline:     time.Now().AddDate(0, 0, 3),
				CreatedAt:    time.Now().AddDate(0, 0, -14),
				UpdatedAt:    time.Now(),
			},
			goal: models.Goal{
				Deadline:  timePtr(time.Now().AddDate(0, 0, 14)),
				CreatedAt: time.Now().AddDate(0, -1, 0),
			},
			totalTasks:     8,
			completedTasks: 4,
			wantMin:        6,
			wantMax:        9,
		},
		{
			name: "Medium priority, overdue task",
			task: models.Task{
				UserPriority: 2,
				Deadline:     time.Now().AddDate(0, 0, -2),
				CreatedAt:    time.Now().AddDate(0, 0, -30),
				UpdatedAt:    time.Now().AddDate(0, 0, -10),
			},
			goal: models.Goal{
				Deadline:  timePtr(time.Now().AddDate(0, 0, 14)),
				CreatedAt: time.Now().AddDate(0, -2, 0),
			},
			totalTasks:     5,
			completedTasks: 1,
			wantMin:        8,
			wantMax:        10,
		},
		{
			name: "High priority, deadline tomorrow, goal barely started, stale",
			task: models.Task{
				UserPriority: 3,
				Deadline:     time.Now().AddDate(0, 0, 1),
				CreatedAt:    time.Now().AddDate(0, -1, 0),
				UpdatedAt:    time.Now().AddDate(0, 0, -14),
			},
			goal: models.Goal{
				Deadline:  timePtr(time.Now().AddDate(0, 0, 7)),
				CreatedAt: time.Now().AddDate(0, -2, 0),
			},
			totalTasks:     10,
			completedTasks: 1,
			wantMin:        9,
			wantMax:        10,
		},
		{
			name: "Low priority, no deadlines anywhere, exploration goal",
			task: models.Task{
				UserPriority: 1,
				CreatedAt:    time.Now().AddDate(0, 0, -3),
				UpdatedAt:    time.Now(),
			},
			goal: models.Goal{
				CreatedAt: time.Now().AddDate(0, 0, -10),
			},
			totalTasks:     4,
			completedTasks: 2,
			wantMin:        1,
			wantMax:        2,
		},
		{
			name: "Medium priority, plenty of time, goal on track",
			task: models.Task{
				UserPriority: 2,
				Deadline:     time.Now().AddDate(0, 0, 60),
				CreatedAt:    time.Now().AddDate(0, 0, -5),
				UpdatedAt:    time.Now(),
			},
			goal: models.Goal{
				Deadline:  timePtr(time.Now().AddDate(0, 0, 90)),
				CreatedAt: time.Now().AddDate(0, 0, -10),
			},
			totalTasks:     6,
			completedTasks: 3,
			wantMin:        2,
			wantMax:        3,
		},
		{
			name: "No tasks in goal",
			task: models.Task{
				UserPriority: 2,
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
			goal: models.Goal{
				Deadline:  timePtr(time.Now().AddDate(0, 0, 30)),
				CreatedAt: time.Now().AddDate(0, 0, -5),
			},
			totalTasks:     0,
			completedTasks: 0,
			wantMin:        2,
			wantMax:        3,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.task.ID = uuid.New()
			tt.goal.ID = uuid.New()

			got := CalculateUrgency(tt.task, tt.goal, tt.totalTasks, tt.completedTasks)

			if got < tt.wantMin || got > tt.wantMax {
				t.Errorf("CalculateUrgency() = %d, want between %d-%d", got, tt.wantMin, tt.wantMax)
			}
		})
	}
}
