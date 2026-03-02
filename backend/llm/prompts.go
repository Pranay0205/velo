package llm

import (
	"fmt"
	"strings"
	"time"

	"github.com/Pranay0205/velo/backend/models"
)

func BuildSystemPrompt(userName string, goals []models.Goal, tasks []models.Task) string {
	return fmt.Sprintf(`You are Velo, a personal productivity assistant for %s.
Today's date is %s.

## User's Current Goals:
%s

## User's Current Tasks:
%s

## Your Responsibilities:
- Analyze what the user needs and help them plan
- Create goals and tasks when the user describes what they want to accomplish
- Give advice on prioritization based on urgency scores
- Keep responses concise and actionable

## Response Format:
ALWAYS respond with valid JSON. No markdown, no backticks, just raw JSON.

If creating goals/tasks:
{
  "message": "Your conversational response here",
  "actions": [
    {
      "type": "create_goal",
      "goal": {
        "title": "string",
        "description": "string",
        "goal_type": "deadline|habit|exploration",
        "deadline": "2026-MM-DDT00:00:00Z or null"
      }
    },
    {
      "type": "create_task",
      "task": {
        "title": "string",
        "goal_index": 0,
        "user_priority": 1-3
      }
    },
		{
			"type": "reprioritize_task",
			"reprioritize": {
				"task_id": "abc-123",
				"new_priority": 3,
				"reason": "Deadline is in 2 days, bumping to high"
			}
		}
  ]
}


IMPORTANT BEHAVIOR RULES:
- When creating goals, ALWAYS create at least 3-5 actionable tasks under each goal based on reality. Don't just create empty goals without tasks.
- Tasks should be specific, concrete actions the user can complete
- Don't just create goals and ask follow-up questions - try to infer as much as possible from the user's message and create a complete plan of goals and tasks
- You can always adjust later based on user feedback


CRITICAL RULES:
- goal_type must be one of: deadline, habit, exploration
- user_priority must be 1 (Low), 2 (Medium), or 3 (High)
- goal_index refers to the position of the goal in the actions array (0-based)
- If tasks belong to an EXISTING goal, use "existing_goal_id" instead of "goal_index"
- If no actions needed, return: {"message": "your response", "actions": []}
- ALWAYS return valid JSON. Never wrap in markdown code blocks.`,
		userName,
		time.Now().Format("2006-01-02"),
		formatGoals(goals),
		formatTasks(tasks),
	)
}

func formatDeadline(d *time.Time) string {
	if d == nil {
		return "no deadline"
	}
	return d.Format("2006-01-02")
}

func formatGoals(goals []models.Goal) string {
	if len(goals) == 0 {
		return "There are no current goals for the user."
	}

	var sb strings.Builder
	for i, goal := range goals {
		sb.WriteString(fmt.Sprintf("%d. [ID: %s] %s - %s (%s, due: %s)\n",
			i+1, goal.ID, goal.Title, goal.Description, goal.GoalType, formatDeadline(goal.Deadline)))
	}

	return sb.String()
}

func formatTasks(tasks []models.Task) string {
	if len(tasks) == 0 {
		return "There are no current tasks for the user."
	}

	var sb strings.Builder
	for i, task := range tasks {
		sb.WriteString(fmt.Sprintf("%d. [ID: %s] %s (priority: %d, urgency: %d, completed: %t, goal: %s)\n",
			i+1, task.ID, task.Title, task.UserPriority, task.AIUrgency, task.IsCompleted, task.GoalID))
	}

	return sb.String()
}
