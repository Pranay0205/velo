package handlers

import (
	"github.com/Pranay0205/velo/backend/models"
	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

func (h *AuthHandler) Me(c fiber.Ctx) error {
	userID := c.Locals("userID").(uuid.UUID)

	var user models.User
	result := h.DB.First(&user, "id = ?", userID)

	if result.Error != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to retrieve user")
	}

	return utils.RespondSuccess(c, fiber.StatusOK, fiber.Map{
		"email": user.Email,
		"name":  user.Name,
	})
}
