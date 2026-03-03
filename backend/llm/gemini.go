package llm

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/Pranay0205/velo/backend/models"
	"google.golang.org/genai"
)

type GeminiClient struct {
	client *genai.Client
}

func NewGeminiClient() (*GeminiClient, error) {
	geminiApiKey := os.Getenv("GEMINI_KEY")
	if geminiApiKey == "" {
		return nil, errors.New("GEMINI_KEY environment variable is not set")
	}

	genAIClient, err := genai.NewClient(context.Background(), &genai.ClientConfig{
		APIKey: geminiApiKey,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	return &GeminiClient{client: genAIClient}, nil

}

func (gc *GeminiClient) Chat(ctx context.Context, systemPrompt string, chatHistory []models.ChatMessage) (*LLMResponse, error) {
	var messages []*genai.Content

	for _, msg := range chatHistory {
		var role genai.Role
		switch msg.Role {
		case "user":
			role = genai.RoleUser
		case "assistant":
			role = genai.RoleModel
		default:
			role = genai.RoleUser // default to user if unknown role
		}

		messages = append(messages, genai.NewContentFromText(msg.Message, role))
	}

	resp, err := gc.client.Models.GenerateContent(ctx, os.Getenv("GEMINI_MODEL"), messages, &genai.GenerateContentConfig{
		SystemInstruction: genai.NewContentFromText(systemPrompt, "user"),
	})

	if err != nil {
		return &LLMResponse{}, err
	}

	log.Printf("Raw Gemini response: %s", resp.Text())

	validatedResponse, err := ValidateResponse(resp.Text())
	if err != nil {
		return &LLMResponse{}, err
	}
	return validatedResponse, nil
}

func ValidateResponse(llmResponse string) (*LLMResponse, error) {
	// Strip markdown backticks if Gemini wraps them despite instructions
	cleaned := strings.TrimSpace(llmResponse)
	cleaned = strings.TrimPrefix(cleaned, "```json")
	cleaned = strings.TrimPrefix(cleaned, "```")
	cleaned = strings.TrimSuffix(cleaned, "```")
	cleaned = strings.TrimSpace(cleaned)

	var parsedResponse LLMResponse
	if err := json.Unmarshal([]byte(cleaned), &parsedResponse); err != nil {
		return &LLMResponse{
			Message: cleaned,
			Actions: []Action{},
		}, nil
	}
	// Validate actions
	for i, action := range parsedResponse.Actions {
		switch action.Type {
		case "create_goal":
			if action.Goal == nil {
				return &LLMResponse{}, fmt.Errorf("action %d: create_goal missing goal data", i)
			}
		case "create_task":
			if action.Task == nil {
				return &LLMResponse{}, fmt.Errorf("action %d: create_task missing task data", i)
			}
			if action.Task.UserPriority < 1 || action.Task.UserPriority > 3 {
				action.Task.UserPriority = 2 // default to medium instead of failing
			}
		case "reprioritize_task":
			if action.Reprioritize == nil {
				return &LLMResponse{}, fmt.Errorf("action %d: reprioritize missing data", i)
			}
		default:
			return &LLMResponse{}, fmt.Errorf("action %d: unknown type %s", i, action.Type)
		}
	}

	return &parsedResponse, nil
}
