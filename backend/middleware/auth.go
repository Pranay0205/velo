package middleware

import (
	"github.com/Pranay0205/velo/backend/auth"
	"github.com/Pranay0205/velo/backend/utils"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

func AuthMiddleware(JWTSecret string) fiber.Handler {
	return func(c fiber.Ctx) error {
		token := c.Cookies("auth_token")

		if token == "" {
			return utils.RespondError(c, fiber.StatusUnauthorized, "Missing auth token")
		}

		claims, err := auth.ValidateJWT(token, JWTSecret)
		if err != nil {
			return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid auth token")
		}

		parsedID, err := uuid.Parse(claims.UserID)
		if err != nil {
			return utils.RespondError(c, fiber.StatusUnauthorized, "Invalid user ID in token")
		}

		c.Locals("userID", parsedID)

		return c.Next()
	}
}
