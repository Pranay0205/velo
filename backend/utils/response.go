package utils

import "github.com/gofiber/fiber/v3"

func RespondError(c fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(fiber.Map{
		"error": message,
	})
}

func RespondSuccess(c fiber.Ctx, status int, data any) error {
	return c.Status(status).JSON(fiber.Map{
		"data": data,
	})
}
