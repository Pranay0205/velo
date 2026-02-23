package database

import (
	"fmt"
	"log"
	"os"

	"github.com/Pranay0205/velo/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func ConnectDB() (*gorm.DB, error) {

	HOST := os.Getenv("DB_HOST")
	PORT := os.Getenv("DB_PORT")
	USER := os.Getenv("DB_USER")
	PASSWORD := os.Getenv("DB_PASSWORD")
	DBNAME := os.Getenv("DB_NAME")
	SSLMODE := os.Getenv("DB_SSLMODE")

	dsn := fmt.Sprintf("host=%s port=%s dbname=%s user=%s password=%s sslmode=%s", HOST, PORT, DBNAME, USER, PASSWORD, SSLMODE)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		log.Printf("Failed to connect to database: %v", err)

		return &gorm.DB{}, fmt.Errorf("Failed to connect to database")
	}

	log.Println("Database connection established")

	db.AutoMigrate(&models.User{}, &models.Goal{}, &models.Task{})

	return db, nil
}
