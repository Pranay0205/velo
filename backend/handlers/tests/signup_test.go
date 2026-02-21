package tests

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/Pranay0205/velo/backend/handlers"
	"github.com/Pranay0205/velo/backend/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestApp(t *testing.T) *fiber.App {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal("Failed to connect test DB:", err)
	}
	db.AutoMigrate(&models.User{})

	handler := &handlers.AuthHandler{DB: db}
	app := fiber.New()
	app.Post("/api/signup", handler.Signup)
	return app
}

func TestSignupSuccess(t *testing.T) {
	app := setupTestApp(t)

	body, _ := json.Marshal(map[string]string{
		"name":      "Test",
		"last_name": "User",
		"email":     "test@example.com",
		"password":  "password123",
	})

	req, _ := http.NewRequest("POST", "/api/signup", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal("Request failed:", err)
	}

	if resp.StatusCode != fiber.StatusCreated {
		respBody, _ := io.ReadAll(resp.Body)
		t.Fatalf("Expected 201, got %d: %s", resp.StatusCode, string(respBody))
	}
}

func TestSignupDuplicateEmail(t *testing.T) {
	app := setupTestApp(t)

	body, _ := json.Marshal(map[string]string{
		"name":      "Test",
		"last_name": "User",
		"email":     "dupe@example.com",
		"password":  "password123",
	})

	req, _ := http.NewRequest("POST", "/api/signup", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	app.Test(req)

	// Second signup with same email
	req2, _ := http.NewRequest("POST", "/api/signup", bytes.NewReader(body))
	req2.Header.Set("Content-Type", "application/json")
	resp, err := app.Test(req2)
	if err != nil {
		t.Fatal("Request failed:", err)
	}

	if resp.StatusCode == fiber.StatusCreated {
		t.Fatal("Should reject duplicate email")
	}
}

func TestSignupInvalidBody(t *testing.T) {
	app := setupTestApp(t)

	req, _ := http.NewRequest("POST", "/api/signup", bytes.NewReader([]byte("not json")))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatal("Request failed:", err)
	}

	if resp.StatusCode != fiber.StatusBadRequest {
		t.Fatalf("Expected 400, got %d", resp.StatusCode)
	}
}
