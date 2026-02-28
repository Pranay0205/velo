package handlers

import (
	"time"

	"github.com/Pranay0205/velo/backend/models"
	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

var userPriority map[int]string = map[int]string{
	1: "Low",
	2: "Medium",
	3: "High",
}

func (t *TaskHandler) CreateTask(c fiber.Ctx) error {
	type createTaskRequest struct {
		Title        string     `json:"title"`
		GoalID       uuid.UUID  `json:"goal_id"`
		Description  *string    `json:"description"`
		Deadline     *time.Time `json:"deadline"`
		UserPriority int        `json:"user_priority"` // 1-3: Low, Med, High
	}

	var req createTaskRequest
	if err := c.Bind().JSON(&req); err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid user session")
	}

	if req.Title == "" {
		return utils.RespondError(c, fiber.StatusBadRequest, "Title is required")
	}

	if req.GoalID == uuid.Nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Goal ID is required")
	}

	if _, ok = userPriority[req.UserPriority]; !ok {
		return utils.RespondError(c, fiber.StatusBadRequest, "User priority must be between low and high")
	}

	task := models.Task{
		UserID:       userID,
		GoalID:       req.GoalID,
		Title:        req.Title,
		UserPriority: req.UserPriority,
	}

	if req.Description != nil {
		task.Description = *req.Description
	}

	if req.Deadline != nil {
		task.Deadline = *req.Deadline
	}

	var goal models.Goal
	if err := t.DB.Where("id = ? AND user_id = ?", req.GoalID, userID).First(&goal).Error; err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Goal not found or doesn't belong to you")
	}

	if err := t.DB.Create(&task).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to create task")
	}

	return utils.RespondSuccess(c, fiber.StatusCreated, map[string]interface{}{
		"id":            task.ID,
		"title":         task.Title,
		"description":   task.Description,
		"deadline":      task.Deadline,
		"user_priority": userPriority[task.UserPriority],
	})
}

func (t *TaskHandler) GetTasks(c fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid user session")
	}

	query := t.DB.Where("user_id = ?", userID)

	if goalID := c.Query("goal_id"); goalID != "" {
		parsedGoalID, err := uuid.Parse(goalID)
		if err != nil {
			return utils.RespondError(c, fiber.StatusBadRequest, "Invalid goal ID")
		}
		query = query.Where("goal_id = ?", parsedGoalID)
	}

	var tasks []models.Task
	if err := query.Find(&tasks).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve tasks")
	}

	return utils.RespondSuccess(c, fiber.StatusOK, tasks)
}

func (t *TaskHandler) UpdateTask(c fiber.Ctx) error {
	type updateTaskRequest struct {
		Title        *string    `json:"title"`
		Description  *string    `json:"description"`
		Deadline     *time.Time `json:"deadline"`
		UserPriority *int       `json:"user_priority"` // 1-3: Low, Med, High
		IsCompleted  *bool      `json:"is_completed"`
	}

	var req updateTaskRequest
	if err := c.Bind().JSON(&req); err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	userID, ok := c.Locals("userID").(uuid.UUID)

	if !ok {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid user session")
	}

	taskID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid task ID")
	}

	var task models.Task
	if err := t.DB.Where("id = ? AND user_id = ?", taskID, userID).First(&task).Error; err != nil {
		return utils.RespondError(c, fiber.StatusNotFound, "Task not found")
	}

	if req.Title != nil {
		task.Title = *req.Title
	}

	if req.Description != nil {
		task.Description = *req.Description
	}

	if req.Deadline != nil {
		task.Deadline = *req.Deadline
	}

	if req.UserPriority != nil {
		if _, ok = userPriority[*req.UserPriority]; !ok {
			return utils.RespondError(c, fiber.StatusBadRequest, "User priority must be between low and high")
		}
		task.UserPriority = *req.UserPriority
	}

	if req.IsCompleted != nil {
		task.IsCompleted = *req.IsCompleted
	}

	if err := t.DB.Save(&task).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to update task")
	}

	return utils.RespondSuccess(c, fiber.StatusOK, task)
}

func (t *TaskHandler) DeleteTask(c fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid user session")
	}

	taskID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid task ID")
	}

	if err := t.DB.Where("id = ? AND user_id = ?", taskID, userID).Delete(&models.Task{}).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to delete task")
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (t *TaskHandler) CompleteTask(c fiber.Ctx) error {
	type completeTaskRequest struct {
		IsCompleted bool `json:"is_completed"`
	}

	var req completeTaskRequest
	if err := c.Bind().JSON(&req); err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid user session")
	}

	taskID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid task ID")
	}

	var task models.Task
	if err := t.DB.Where("id = ? AND user_id = ?", taskID, userID).First(&task).Error; err != nil {
		return utils.RespondError(c, fiber.StatusNotFound, "Task not found")
	}

	task.IsCompleted = req.IsCompleted

	if err := t.DB.Save(&task).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to update task completion status")
	}

	return utils.RespondSuccess(c, fiber.StatusOK, task)
}
