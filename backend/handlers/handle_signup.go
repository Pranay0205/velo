package handlers

import (
	"strings"

	"github.com/Pranay0205/velo/backend/auth"
	"github.com/Pranay0205/velo/backend/models"
	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

func (h *AuthHandler) Signup(c fiber.Ctx) error {

	type requestStruct struct {
		Name     string `json:"name"`
		LastName string `json:"last_name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req requestStruct
	err := c.Bind().JSON(&req)

	if err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, err.Error())
	}

	user := models.User{
		ID:           uuid.New(),
		Name:         req.Name,
		LastName:     req.LastName,
		Email:        req.Email,
		PasswordHash: hashedPassword,
	}

	result := h.DB.Create(&user)
	if result.Error != nil {

		if strings.Contains(result.Error.Error(), "UNIQUE") {
			return utils.RespondError(c, fiber.StatusConflict, "Email already in use")
		}

		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to create user")
	}

	return utils.RespondSuccess(c, fiber.StatusCreated, fiber.Map{
		"id":    user.ID,
		"email": user.Email,
	})

}
