package handlers

import (
	"time"

	"github.com/Pranay0205/velo/backend/models"
	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

var validGoalTypes = map[string]bool{
	"deadline":    true,
	"habit":       true,
	"exploration": true,
}

var validGoalStatuses = map[string]bool{
	"not_started": true,
	"in_progress": true,
	"completed":   true,
	"abandoned":   true,
}

// GoalHandler handles goal-related requests

// Method to create a new goal
func (g *GoalHandler) CreateGoal(c fiber.Ctx) error {
	type createGoalRequest struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		GoalType    string     `json:"goal_type"`
		Status      string     `json:"status"`
		Deadline    *time.Time `json:"deadline"`
		Frequency   *int       `json:"frequency"`
	}

	var req createGoalRequest
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

	if !validGoalTypes[req.GoalType] {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid goal type")
	}

	if req.GoalType == "deadline" && req.Deadline == nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Deadline is required for deadline goals")
	}

	if req.GoalType == "habit" && req.Frequency == nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Frequency is required for habit goals")
	}

	goal := models.Goal{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		GoalType:    req.GoalType,
		Status:      "not_started",
		Deadline:    req.Deadline,
		Frequency:   req.Frequency,
	}

	if err := g.DB.Create(&goal).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to create goal")
	}

	return utils.RespondSuccess(c, fiber.StatusCreated, goal)
}

// Method to get all goals for the authenticated user
func (g *GoalHandler) GetGoals(c fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid user session")
	}

	var goals []models.Goal
	if err := g.DB.Where("user_id = ?", userID).Find(&goals).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve goals")
	}

	return utils.RespondSuccess(c, fiber.StatusOK, goals)
}

// Method to update a specific goal
func (g *GoalHandler) UpdateGoal(c fiber.Ctx) error {
	type updateGoalRequest struct {
		Title       *string    `json:"title"`
		Description *string    `json:"description"`
		Status      *string    `json:"status"`
		Deadline    *time.Time `json:"deadline"`
		Frequency   *int       `json:"frequency"`
	}

	var req updateGoalRequest
	if err := c.Bind().JSON(&req); err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid user session")
	}

	goalID := c.Params("id")
	var goal models.Goal
	if err := g.DB.Where("id = ? AND user_id = ?", goalID, userID).First(&goal).Error; err != nil {
		return utils.RespondError(c, fiber.StatusNotFound, "Goal not found")
	}

	if req.Title != nil {
		goal.Title = *req.Title
	}

	if req.Description != nil {
		goal.Description = *req.Description
	}

	if req.Status != nil && !validGoalStatuses[*req.Status] {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid status")
	}

	if req.Deadline != nil {
		goal.Deadline = req.Deadline
	}

	if req.Frequency != nil {
		goal.Frequency = req.Frequency
	}

	if err := g.DB.Save(&goal).Error; err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to update goal")
	}

	return utils.RespondSuccess(c, fiber.StatusOK, goal)
}

// Method to delete a specific goal (soft delete by setting status to "abandoned")
func (g *GoalHandler) DeleteGoal(c fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uuid.UUID)
	if !ok {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid user session")
	}

	goalID := c.Params("id")

	result := g.DB.Model(&models.Goal{}).Where("id = ? AND user_id = ?", goalID, userID).Update("status", "abandoned")

	if result.Error != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to delete goal")
	}

	if result.RowsAffected == 0 {
		return utils.RespondError(c, fiber.StatusNotFound, "Goal not found")
	}

	return c.SendStatus(fiber.StatusNoContent)
}
