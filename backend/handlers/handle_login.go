package handlers

import (
	"os"
	"time"

	"github.com/Pranay0205/velo/backend/auth"
	"github.com/Pranay0205/velo/backend/models"
	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
)

func (h *AuthHandler) Login(c fiber.Ctx) error {
	type loginRequest struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var req loginRequest
	if err := c.Bind().JSON(&req); err != nil {
		return utils.RespondError(c, fiber.StatusBadRequest, "Invalid request body")
	}

	var user models.User

	result := h.DB.Where("email = ?", req.Email).First(&user)

	if result.Error != nil {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid email or password")
	}

	if !auth.CheckPasswordHash([]byte(req.Password), []byte(user.PasswordHash)) {
		return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid email or password")
	}

	jwtToken, err := auth.GenerateJWT(user.ID.String(), h.JWTSecret)
	if err != nil {
		return utils.RespondError(c, fiber.StatusInternalServerError, "Failed to generate token")
	}

	cookie := new(fiber.Cookie)
	cookie.Name = "auth_token"
	cookie.Value = jwtToken
	cookie.HTTPOnly = true

	if os.Getenv("ENV") == "production" {
		cookie.Secure = true
	} else {
		cookie.Secure = false
	}

	cookie.SameSite = "Strict"
	cookie.Expires = time.Now().Add(24 * time.Hour)

	c.Cookie(cookie)

	return utils.RespondSuccess(c, fiber.StatusOK, fiber.Map{
		"message": "Login successful!",
		"user": fiber.Map{
			"email": user.Email,
			"name":  user.Name,
		},
	})
}
