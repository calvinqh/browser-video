package client

import (
	"sync"

	"github.com/gofiber/websocket/v2"
	"go.uber.org/zap"
)

type UserClient struct {
	Username   string
	logger *zap.Logger
	Inbox chan ForwardedSignalMessage
	ShutdownSignal chan bool
	Connection *websocket.Conn
}

func NewUserClient(username string, conn *websocket.Conn) *UserClient {
	userClient := &UserClient{Username: username, Connection: conn, Inbox: make(chan ForwardedSignalMessage), logger: newClientLogger()}
	return userClient
}

func newClientLogger() *zap.Logger {
	logger, _ := zap.NewDevelopment()
	return logger;
}

func (client *UserClient) ListenInbox() {
	for {
		select {
		case message := <-client.Inbox:
			client.logger.Sugar().Infof("[%v] Got a message, sending it to client", client.Username)
			client.Connection.WriteJSON(message)
		case shouldShutdown := <-client.ShutdownSignal:
			if shouldShutdown {
				client.logger.Sugar().Infof("[%v] Got shutdown signal\n", client.Username)
			}
		}
	}
}

// Basically represents our user database.
type UserStore struct {
	Users sync.Map
}

func NewUserStore() *UserStore {
	return &UserStore{Users: sync.Map{}}
}

// Keep tracks of all users that are active (reachable)
type UserClientRegistry struct {
	AvailableUsers sync.Map
}

func NewUserClientRegistry() *UserClientRegistry {
	return &UserClientRegistry{AvailableUsers: sync.Map{}}
}
