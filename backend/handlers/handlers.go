package handlers

import (
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
