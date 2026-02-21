package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()

	// Middleware
	app.Use(logger.New())

	// TODO: Create a custom middleware that checks the 'X-Velo-Burnout' header.
	// If the user's "Burnout Score" is too high, it should inject a
	// message into the response suggesting they take a break.

	app.Get("/api/tasks", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Velo API is online",
			"tasks":   []string{"Task 1", "Task 2"},
		})
	})

	app.Listen(":3000")
}
