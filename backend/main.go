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
	"github.com/gofiber/fiber/v3/middleware/logger"
)

func main() {

	// Load environment variables from .env file
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file - make sure it exists and is properly formatted")
	}

	db, err := database.ConnectDB()

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	authHandler := &handlers.AuthHandler{DB: db, JWTSecret: os.Getenv("JWT_SECRET")}
	goalHandler := &handlers.GoalHandler{DB: db}
	taskHandler := &handlers.TaskHandler{DB: db}

	app := fiber.New()
	app.Use(logger.New())

	app.Get("/healthz", healthcheck.New())

	app.Get(healthcheck.LivenessEndpoint, healthcheck.New())

	app.Post("/api/login", authHandler.Login)

	app.Post("/api/signup", authHandler.Signup)

	api := app.Group("/api", middleware.AuthMiddleware(os.Getenv("JWT_SECRET")))

	api.Get("/goals", goalHandler.GetGoals)

	api.Post("/goals", goalHandler.CreateGoal)

	api.Put("/goals/:id", goalHandler.UpdateGoal)

	api.Delete("/goals/:id", goalHandler.DeleteGoal)

	api.Get("/tasks", taskHandler.GetTasks)

	api.Post("/tasks", taskHandler.CreateTask)

	api.Patch("/tasks/:id/complete", taskHandler.CompleteTask)

	api.Put("/tasks/:id", taskHandler.UpdateTask)

	api.Delete("/tasks/:id", taskHandler.DeleteTask)

	api.Get("/me", authHandler.Me)

	app.Listen(":3000")
}
