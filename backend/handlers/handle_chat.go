package handlers

import (
	"fmt"

	"github.com/Pranay0205/velo/backend/llm"
	"github.com/Pranay0205/velo/backend/models"
	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

func (h *ChatHandler) Chat(c fiber.Ctx) error {
	type ChatRequest struct {
		Message string `json:"message"`
	}

	var req ChatRequest
	if err := c.Bind().JSON(&req); err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	userID := c.Locals("userID").(uuid.UUID)

	newChat := models.ChatMessage{
		UserID:  userID,
		Message: req.Message,
		Role:    "user",
	}

	if err := h.DB.Create(&newChat).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to save chat message")
	}

	var goals []models.Goal
	if err := h.DB.Where("user_id = ?", userID).Find(&goals).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve goals")
	}

	var tasks []models.Task
	if err := h.DB.Where("user_id = ?", userID).Find(&tasks).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve tasks")
	}

	var userName string
	if err := h.DB.Model(&models.User{}).Where("id = ?", userID).Pluck("name", &userName).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve user info")
	}

	systemPrompt := llm.BuildSystemPrompt(userName, goals, tasks)

	llmResponse, err := h.Gemini.Chat(c.Context(), systemPrompt, req.Message)
	if err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to get response from LLM")
	}

	assistantChat := models.ChatMessage{
		UserID:  userID,
		Message: llmResponse.Message,
		Role:    "assistant",
	}

	if err := h.DB.Create(&assistantChat).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to save assistant message")
	}

	if err := h.executeLLMActions(userID, llmResponse.Actions); err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, fmt.Sprintf("Failed to execute LLM actions: %v", err))
	}

	return utils.RespondSuccess(c, fiber.StatusOK, fiber.Map{
		"message": llmResponse.Message,
		"actions": llmResponse.Actions,
	})
}

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

		case "reprioritize_task":

			if action.Reprioritize == nil {
				continue
			}

			if err := h.rePrioritizeTask(userID, action.Reprioritize); err != nil {
				return fmt.Errorf("failed to reprioritize task: %w", err)
			}
		default:
			return fmt.Errorf("unknown action type: %s", action.Type)
		}
	}

	return nil

}

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

func (h *ChatHandler) rePrioritizeTask(userID uuid.UUID, data *llm.ReprioritizeAction) error {
	result := h.DB.Model(&models.Task{}).
		Where("id = ? AND user_id = ?", data.TaskID, userID).
		Update("user_priority", data.NewPriority)

	if result.RowsAffected == 0 {
		return fmt.Errorf("task not found: %s", data.TaskID)
	}
	return result.Error
}
