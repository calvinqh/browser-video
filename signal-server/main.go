package main

import (
	"context"
	"github.com/calvinqh/webrtc-signal-server/client"
	"github.com/gofiber/fiber/v2"
	"go.uber.org/fx"
	"go.uber.org/fx/fxevent"
	"go.uber.org/zap"
)

func RegisterHandlers(fiberApp *fiber.App, logger *zap.Logger, clientHandler *client.ClientHandler) {
	logger.Info("Invoked RegisterHandlers")
	fiberApp.Get("/healthcheck", func(ctx *fiber.Ctx) error {
		return ctx.SendString("success")
	})
	fiberApp.Post("/v1/register", clientHandler.Register)
	fiberApp.Get("/v1/connect", clientHandler.CreateConnectHandler())
	fiberApp.Get("/v1/user", clientHandler.User)
	fiberApp.Get("/v1/kick-active-users", clientHandler.KickActiveUsers)
}

func main() {
	app := fx.New(
		fx.Provide(NewLogger, NewFiberApp, client.NewClientHandler, client.NewUserClientRegistry, client.NewUserStore),
		fx.Invoke(RegisterHandlers),
		fx.WithLogger(func(logger *zap.Logger) fxevent.Logger {
			return &fxevent.ZapLogger{Logger: logger}
		}),
	)
	app.Run()
}

func NewFiberApp(lc fx.Lifecycle, logger *zap.Logger) *fiber.App {
	logger.Info("Invoked NewFiberApp")
	fiberApp := fiber.New()

	lc.Append(fx.Hook{
		OnStart: func(context.Context) error {
			logger.Info("Starting http server")
			go fiberApp.Listen(":8000")
			return nil
		},
		OnStop: func(context.Context) error {
			logger.Info("Stopping http server")
			err := fiberApp.Shutdown()
			if err != nil {
				logger.Error("Encountered error when trying to shutdown app")
				return err
			}
			logger.Info("Successfully shutdown fiber app")
			return nil
		},
	})

	return fiberApp
}

func NewLogger() *zap.Logger {
	// TODO: read from either environment or config to build logger / which logger to use?
	//logger, _ := zap.NewProduction()
	logger, _ := zap.NewDevelopment()
	return logger
}
