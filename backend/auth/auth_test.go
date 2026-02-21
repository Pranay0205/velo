package auth

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestHashPassword(t *testing.T) {
	password := "testpassword123"

	hash, err := HashPassword(password)
	if err != nil {
		t.Fatal("HashPassword returned error:", err)
	}

	if hash == password {
		t.Fatal("Hash should not equal plain password")
	}

	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		t.Fatal("Hash should be verifiable with bcrypt:", err)
	}
}

func TestHashPasswordEmpty(t *testing.T) {
	_, err := HashPassword("")
	if err != nil {
		t.Fatal("HashPassword should handle empty string:", err)
	}
}
