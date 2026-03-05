package handlers

import (
	"time"

	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
)

func (h *AuthHandler) Logout(c fiber.Ctx) error {

	// Clear the auth_token cookie by setting its value to an empty string and expiration to a past time
	c.Cookie(&fiber.Cookie{
		Name:     "auth_token",
		Value:    "",
		HTTPOnly: true,
		Expires:  time.Now().Add(-1 * time.Hour),
		Secure:   true,
		SameSite: "Lax",
	})

	return utils.RespondSuccess(c, fiber.StatusOK, fiber.Map{
		"message": "Logged out successfully",
	})
}
