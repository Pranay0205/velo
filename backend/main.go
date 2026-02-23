package main

import (
	"log"
	"os"

	"github.com/Pranay0205/velo/backend/database"
	"github.com/Pranay0205/velo/backend/handlers"
	"github.com/Pranay0205/velo/backend/middleware"
	"github.com/joho/godotenv"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/healthcheck"
)

func main() {

	// Load environment variables from .env file
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file - make sure it exists and is properly formatted")
	}

	db, err := database.ConnectDB()

	authHandler := &handlers.AuthHandler{DB: db, JWTSecret: os.Getenv("JWT_SECRET")}

	app := fiber.New()

	app.Get("/healthz", healthcheck.New())

	app.Get(healthcheck.LivenessEndpoint, healthcheck.New())

	app.Post("/api/login", authHandler.Login)

	app.Post("/api/signup", authHandler.Signup)

	api := app.Group("/api", middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))

	api.Get("/Goals", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "This is a protected route",
		})
	})

	api.Get("/me", authHandler.Me)

	app.Listen(":3000")
}
