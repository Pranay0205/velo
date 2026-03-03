package utils

import (
	"log/slog"
	"os"
)

var baseLogger = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

func Logger(component string) *slog.Logger {
	return baseLogger.With("component", component)
}
