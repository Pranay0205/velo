package handlers

import (
	"fmt"
	"log"
	"slices"

	"github.com/Pranay0205/velo/backend/llm"
	"github.com/Pranay0205/velo/backend/models"
	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

// ChatHandler handles chat interactions between the user and the LLM
func (h *ChatHandler) Chat(c fiber.Ctx) error {
	type ChatRequest struct {
		Message string `json:"message"`
	}

	var req ChatRequest
	if err := c.Bind().JSON(&req); err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	userID := c.Locals("userID").(uuid.UUID)

	log.Printf("[Chat] Received message from user %s: %s", userID, req.Message)

	newChat := models.ChatMessage{
		UserID:  userID,
		Message: req.Message,
		Role:    "user",
	}

	if err := h.DB.Create(&newChat).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to save chat message")
	}

	log.Printf("[Chat] Saved user message to database for user %s", userID)

	var goals []models.Goal
	if err := h.DB.Where("user_id = ? AND status != ?", userID, "abandoned").Find(&goals).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve goals")
	}

	log.Printf("[Chat] Retrieved %d goals for user", len(goals))

	var tasks []models.Task
	if err := h.DB.Where("user_id = ?", userID).Find(&tasks).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve tasks")
	}

	log.Printf("[Chat] Retrieved %d tasks for user", len(tasks))

	var userName string
	if err := h.DB.Model(&models.User{}).Where("id = ?", userID).Pluck("name", &userName).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve user info")
	}

	log.Printf("[Chat] Retrieved user name: %s", userName)

	chatsHistory, err := h.getRecentChatHistory(userID, 20)
	if err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve chat history")
	}

	log.Printf("[Chat] Retrieved chat history for user: %d messages\n", len(chatsHistory))

	systemPrompt := llm.BuildSystemPrompt(userName, goals, tasks)

	llmResponse, err := h.Gemini.Chat(c.Context(), systemPrompt, chatsHistory)
	if err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to get response from LLM")
	}

	log.Printf("[Chat] LLM response: %s", llmResponse.Message)

	var assistantChat *models.ChatMessage

	if llmResponse.Message == "" {
		return utils.RespondError(c, fiber.StatusInternalServerError, "LLM returned an empty response")
	}

	assistantChat = &models.ChatMessage{
		UserID:  userID,
		Message: llmResponse.Message,
		Role:    "assistant",
	}
	if err := h.DB.Create(&assistantChat).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to save assistant message")
	}
	log.Printf("[Chat] Saved assistant message, ID: %s", assistantChat.ID)

	log.Printf("[Chat] Saved assistant message to database for user %s", userID)

	return utils.RespondSuccess(c, fiber.StatusOK, fiber.Map{
		"message": llmResponse.Message,
		"actions": llmResponse.Actions,
	})
}

func (h *ChatHandler) ExecuteActions(c fiber.Ctx) error {
	type ExecuteActionsRequest struct {
		Actions []llm.Action `json:"actions"`
	}

	var req ExecuteActionsRequest
	if err := c.Bind().JSON(&req); err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	if len(req.Actions) == 0 {
		return utils.RespondError(c, fiber.StatusBadRequest, "No actions to execute")
	}

	userID := c.Locals("userID").(uuid.UUID)

	log.Printf("[ExecuteActions] Received %d actions to execute for user %s", len(req.Actions), userID)

	if err := h.executeLLMActions(userID, req.Actions); err != nil {
		log.Printf("[ExecuteActions] Error executing actions: %v", err)
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to execute actions")
	}

	log.Printf("[ExecuteActions] Successfully executed actions for user %s", userID)

	return utils.RespondSuccess(c, fiber.StatusOK, fiber.Map{
		"message": "Actions executed successfully",
	})

}

// GetChatHistory retrieves the recent chat history for the authenticated user
func (h *ChatHandler) GetChatHistory(c fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	chats, err := h.getRecentChatHistory(userID, 50)

	log.Printf("[GetChatHistory] Retrieved %d chat messages for user %s", len(chats), userID)

	if err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve chat history")
	}

	return utils.RespondSuccess(c, fiber.StatusOK, chats)
}

// getRecentChatHistory retrieves the most recent chat messages for a user, ordered oldest to newest
func (h *ChatHandler) getRecentChatHistory(userID uuid.UUID, limit int) ([]models.ChatMessage, error) {
	if limit <= 0 {
		limit = 20
	}

	var chats []models.ChatMessage
	if err := h.DB.Where("user_id = ?", userID).Order("created_at desc").Limit(limit).Find(&chats).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve chat history: %w", err)
	}

	slices.Reverse(chats)

	log.Printf("Retrieved %d chat messages for user %s", len(chats), userID)

	return chats, nil
}

// executeLLMActions processes the actions returned by the LLM
func (h *ChatHandler) executeLLMActions(userID uuid.UUID, actions []llm.Action) error {
	createdGoalIDs := []uuid.UUID{}
	for _, action := range actions {
		switch action.Type {
		case "create_goal":
			goalID, err := h.createGoal(userID, action.Goal)
			createdGoalIDs = append(createdGoalIDs, goalID)
			if err != nil {
				return fmt.Errorf("failed to execute create_goal action: %w", err)
			}

		case "create_task":
			var goalID uuid.UUID
			if action.Task.GoalIndex != nil && *action.Task.GoalIndex < len(createdGoalIDs) {
				goalID = createdGoalIDs[*action.Task.GoalIndex]
			} else if action.Task.ExistingGoalID != nil {
				goalID = uuid.MustParse(*action.Task.ExistingGoalID)
			} else {
				continue
			}
			if err := h.createTask(userID, goalID, action.Task); err != nil {
				return fmt.Errorf("failed to execute create_task action: %w", err)
			}

		case "update_goal":
			if action.UpdateGoalAction == nil {
				continue
			}
			if err := h.updateGoalAction(userID, action.UpdateGoalAction); err != nil {
				return fmt.Errorf("failed to execute update_goal action: %w", err)
			}

		case "delete_goal":
			if action.DeleteGoalAction == nil {
				continue
			}
			if err := h.deleteGoalAction(userID, action.DeleteGoalAction); err != nil {
				return fmt.Errorf("failed to execute delete_goal action: %w", err)
			}

		case "update_task":
			if action.UpdateTaskAction == nil {
				continue
			}
			if err := h.updateTaskAction(userID, action.UpdateTaskAction); err != nil {
				return fmt.Errorf("failed to execute update_task action: %w", err)
			}

		case "delete_task":
			if action.DeleteTaskAction == nil {
				continue
			}
			if err := h.deleteTaskAction(userID, action.DeleteTaskAction); err != nil {
				return fmt.Errorf("failed to execute delete_task action: %w", err)
			}

		case "reprioritize_task":
			if action.ReprioritizeTask == nil {
				continue
			}
			if err := h.rePrioritizeTask(userID, action.ReprioritizeTask); err != nil {
				return fmt.Errorf("failed to reprioritize task: %w", err)
			}

		default:
			return fmt.Errorf("unknown action type: %s", action.Type)
		}
	}
	return nil
}

// createGoal creates a new goal and returns its ID
func (h *ChatHandler) createGoal(userID uuid.UUID, goalData *llm.GoalAction) (uuid.UUID, error) {
	goal := models.Goal{
		UserID:      userID,
		Title:       goalData.Title,
		Description: goalData.Description,
		GoalType:    goalData.GoalType,
		Status:      "not_started",
		Deadline:    goalData.Deadline,
	}

	if err := h.DB.Create(&goal).Error; err != nil {
		return uuid.Nil, err
	}

	return goal.ID, nil
}

// createTask creates a new task under a goal
func (h *ChatHandler) createTask(userID uuid.UUID, goalID uuid.UUID, taskData *llm.TaskAction) error {
	task := models.Task{
		UserID:       userID,
		GoalID:       goalID,
		Title:        taskData.Title,
		UserPriority: taskData.UserPriority,
	}

	if err := h.DB.Create(&task).Error; err != nil {
		return err
	}

	return nil
}

// rePrioritizeTask updates a task's priority
func (h *ChatHandler) rePrioritizeTask(userID uuid.UUID, data *llm.ReprioritizeAction) error {
	result := h.DB.Model(&models.Task{}).
		Where("id = ? AND user_id = ?", data.TaskID, userID).
		Update("user_priority", data.NewPriority)

	if result.RowsAffected == 0 {
		return fmt.Errorf("task not found: %s", data.TaskID)
	}
	return result.Error
}

// updateGoalAction updates specific fields of an existing goal
func (h *ChatHandler) updateGoalAction(userID uuid.UUID, data *llm.UpdateGoalAction) error {
	updates := map[string]interface{}{}

	if data.Title != nil {
		updates["title"] = *data.Title
	}
	if data.Description != nil {
		updates["description"] = *data.Description
	}
	if data.GoalType != nil {
		updates["goal_type"] = *data.GoalType
	}
	if data.Status != nil {
		updates["status"] = *data.Status
	}
	if data.Deadline != nil {
		updates["deadline"] = *data.Deadline
	}
	if data.Frequency != nil {
		updates["frequency"] = *data.Frequency
	}

	if len(updates) == 0 {
		return fmt.Errorf("no fields to update")
	}

	result := h.DB.Model(&models.Goal{}).
		Where("id = ? AND user_id = ?", data.GoalID, userID).
		Updates(updates)

	if result.RowsAffected == 0 {
		return fmt.Errorf("goal not found: %s", data.GoalID)
	}
	return result.Error
}

// deleteGoalAction soft-deletes a goal by setting status to abandoned
func (h *ChatHandler) deleteGoalAction(userID uuid.UUID, data *llm.DeleteGoalAction) error {
	if data.GoalID == "" {
		return fmt.Errorf("goal_id is required for delete_goal action")
	}

	result := h.DB.Where("goal_id = ? AND user_id = ?", data.GoalID, userID).Delete(&models.Task{})

	if result.Error != nil {
		return fmt.Errorf("failed to delete associated tasks: %w", result.Error)
	}

	result = h.DB.Model(&models.Goal{}).
		Where("id = ? AND user_id = ?", data.GoalID, userID).
		Update("status", "abandoned")

	if result.RowsAffected == 0 {
		return fmt.Errorf("goal not found: %s", data.GoalID)
	}
	return result.Error
}

// updateTaskAction updates specific fields of an existing task
func (h *ChatHandler) updateTaskAction(userID uuid.UUID, data *llm.UpdateTaskAction) error {
	updates := map[string]interface{}{}

	if data.Title != nil {
		updates["title"] = *data.Title
	}
	if data.Description != nil {
		updates["description"] = *data.Description
	}
	if data.Deadline != nil {
		updates["deadline"] = *data.Deadline
	}
	if data.UserPriority != nil {
		updates["user_priority"] = *data.UserPriority
	}
	if data.Completed != nil {
		updates["is_completed"] = *data.Completed
	}

	if len(updates) == 0 {
		return fmt.Errorf("no fields to update")
	}

	result := h.DB.Model(&models.Task{}).
		Where("id = ? AND user_id = ?", data.TaskID, userID).
		Updates(updates)

	if result.RowsAffected == 0 {
		return fmt.Errorf("task not found: %s", data.TaskID)
	}
	return result.Error
}

// deleteTaskAction hard-deletes a task
func (h *ChatHandler) deleteTaskAction(userID uuid.UUID, data *llm.DeleteTaskAction) error {
	if data.TaskID == "" {
		return fmt.Errorf("task_id is required for delete_task action")
	}

	result := h.DB.Where("id = ? AND user_id = ?", data.TaskID, userID).
		Delete(&models.Task{})

	if result.RowsAffected == 0 {
		return fmt.Errorf("task not found: %s", data.TaskID)
	}
	return result.Error
}
