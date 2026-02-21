package handlers

import (
	"time"

	"github.com/Pranay0205/velo/backend/auth"
	"github.com/Pranay0205/velo/backend/models"
	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB *gorm.DB
}

func (h *AuthHandler) Signup(c fiber.Ctx) error {
	// 1. Define a struct to hold the incoming JSON (email, password)
	type requestStruct struct {
		Name     string `json:"name"`
		LastName string `json:"last_name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	// 2. Parse the request body into that struct using c.BodyParser()
	var req requestStruct
	err := c.Bind().JSON(&req)

	if err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	// 3. Hash the password with bcrypt
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, err.Error())
	}
	// 4. Create a User model and save it with GORM
	user := models.User{
		ID:           uuid.New(),
		Name:         req.Name,
		LastName:     req.LastName,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	result := h.DB.Create(&user)
	if result.Error != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to create user")
	}

	return utils.RespondSuccess(c, fiber.StatusCreated, fiber.Map{
		"id":    user.ID,
		"email": user.Email,
	})

}
