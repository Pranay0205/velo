package handlers

import (
	"github.com/Pranay0205/velo/backend/llm"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB        *gorm.DB
	JWTSecret string
}

type GoalHandler struct {
	DB *gorm.DB
}

type TaskHandler struct {
	DB *gorm.DB
}

type ChatHandler struct {
	DB     *gorm.DB
	Gemini *llm.GeminiClient
}
