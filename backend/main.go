package main

import (
	"log"

	"github.com/Pranay0205/velo/backend/database"
	"github.com/Pranay0205/velo/backend/handlers"
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

	authHandler := &handlers.AuthHandler{DB: db}

	app := fiber.New()

	app.Get(healthcheck.LivenessEndpoint, healthcheck.New())

	app.Get("/signup", authHandler.Signup)

	app.Get("/healthz", healthcheck.New())

	app.Listen(":3000")
}
