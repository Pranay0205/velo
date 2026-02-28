package engine

import (
	"time"

	"github.com/Pranay0205/velo/backend/models"
)

func clamp(value, min, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}

func CalculateUrgency(task models.Task, goal models.Goal, totalTasks int, completedTasks int) int {

	baseUrgency := task.UserPriority
	deadlinePressure := deadlinePressure(task, goal)
	goalLag := goalLag(totalTasks, completedTasks, deadlinePressure)
	stalenessScore := staleness(task)

	urgency := baseUrgency + deadlinePressure + goalLag + stalenessScore

	return clamp(urgency, 1, 10)
}

func deadlinePressure(task models.Task, goal models.Goal) int {
	if !task.Deadline.IsZero() && task.Deadline.Before(time.Now()) {
		return 4
	}

	var totalDuration, timeElapsed float64

	if !task.Deadline.IsZero() {

		daysLeft := time.Until(task.Deadline).Hours() / 24
		if daysLeft <= 1 {
			return 4
		}
		if daysLeft <= 3 {
			return 3
		}

		totalDuration = task.Deadline.Sub(task.CreatedAt).Hours()
		timeElapsed = time.Since(task.CreatedAt).Hours()

	} else if goal.Deadline != nil {
		daysLeft := time.Until(*goal.Deadline).Hours() / 24
		if daysLeft <= 1 {
			return 4
		}
		if daysLeft <= 3 {
			return 3
		}

		// Otherwise use percentage
		totalDuration = (*goal.Deadline).Sub(goal.CreatedAt).Hours()
		timeElapsed = time.Since(goal.CreatedAt).Hours()
	} else {
		return 0
	}

	if totalDuration <= 0 {
		return 4
	}

	percentUsed := timeElapsed / totalDuration

	if percentUsed < 0.25 {
		return 0
	} else if percentUsed < 0.50 {
		return 1
	} else if percentUsed < 0.75 {
		return 2
	} else if percentUsed < 0.90 {
		return 3
	}
	return 4
}

func goalLag(totalTasks int, completedTasks int, deadlinePressure int) int {
	if deadlinePressure == 0 {
		return 0
	}
	if totalTasks == 0 {
		return 0
	}
	completionRate := float64(completedTasks) / float64(totalTasks)
	if completionRate >= 0.75 {
		return 0
	}
	if completionRate >= 0.50 {
		return 1
	}
	return 2
}

func staleness(task models.Task) int {
	if task.Deadline.IsZero() || task.Deadline.Before(time.Now()) {
		return 0
	}

	idleDays := time.Since(task.UpdatedAt).Hours() / 24
	daysLeft := time.Until(task.Deadline).Hours() / 24
	idleRatio := idleDays / (idleDays + daysLeft)

	if idleRatio >= 0.25 {
		return 1
	}
	return 0
}
