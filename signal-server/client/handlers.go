package client

import (
	"encoding/json"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/valyala/fasthttp"
	"go.uber.org/zap"
)

/**
 * Handler Dependencies
 */
type ClientHandler struct {
	Logger          *zap.Logger
	UserStore *UserStore
	UserClientRegistry *UserClientRegistry
}

/**
 * Inject Dependencies
 */
func NewClientHandler(logger *zap.Logger,  userStore *UserStore, userClientRegistry *UserClientRegistry) *ClientHandler {
	return &ClientHandler{Logger: logger, UserStore: userStore, UserClientRegistry: userClientRegistry}
}

// Checks if the user exists, and will information regarding the user.
func (h *ClientHandler) User(ctx *fiber.Ctx) error {
	h.Logger.Info("ClientHandler: User")
	userCookie := ctx.Cookies("user_username")
	//  TODO: validate the client cookies
	_, loaded := h.UserStore.Users.Load(userCookie)
	if !loaded {
		h.Logger.Sugar().Infof("User does not exist: %v", userCookie)
		ctx.SendStatus(401)
		ctx.Response().Header.Add("Clear-Site-Data", "\"cookies\"")
		return nil
	}

	// todo: retrieve information regarding the user?
	ctx.SendStatus(200)
	return nil
}

type SignalMessage struct {
	Target string `json:"target"`
	Type string `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type ForwardedSignalMessage struct {
	Originator string `json:"originator"`
	Target string `json:"target"`
	Type string `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

func NewForwardedSignalMessage(original SignalMessage, originator string) ForwardedSignalMessage {
	return ForwardedSignalMessage{
		Target: original.Target,
		Type: original.Type,
		Payload: original.Payload,
		Originator: originator,
	};
}

// Returns a websocket handler for clients connecting here
func (h *ClientHandler) CreateConnectHandler() fiber.Handler {
	return websocket.New(func(c *websocket.Conn) {
		h.Logger.Info("ClientHandler: Connect")
		userCookie := c.Cookies("user_username")
		//  TODO: validate the client cookies
		_, loaded := h.UserStore.Users.Load(userCookie)
		if !loaded {
			h.Logger.Sugar().Infof("User does not exist: %v", userCookie)
			c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(4000, ConnectStatus_Unauthenticated))
			return
		}
		h.Logger.Sugar().Infof("Validated connect for user: %v", userCookie)

		// register the client to signal registry, to mark that they are available to be connected.
		userClient := NewUserClient(userCookie, c)
		_, clientAlreadyExists := h.UserClientRegistry.AvailableUsers.LoadOrStore(userCookie, userClient)
		if clientAlreadyExists {
			h.Logger.Sugar().Infof("Client already exists for the user: %v", userCookie)
			c.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(4000, ConnectStatus_AlreadyExists))
			return
		}
		// start up the listen/message forward routine.
		go userClient.ListenInbox()
		// setup close handler, to evict connection from registry
		c.SetCloseHandler(func(code int, text string) error {
			h.Logger.Sugar().Infof("Removing user: %v from client registry", userCookie);
			h.UserClientRegistry.AvailableUsers.Delete(userCookie)
			userClient.ShutdownSignal <- true
			return c.Close()
		})

		// listen for messages
		for {
			var message SignalMessage
			err := c.ReadJSON(&message)
			if err != nil {
				h.Logger.Sugar().Errorf("Error trying to read message from websocket: %+v", err)
				break
			}
			h.Logger.Sugar().Infof("Got message from client, payload=%v test=%v", message, string(message.Payload))
			targetClient, targetExists := h.UserClientRegistry.AvailableUsers.Load(message.Target)
			if !targetExists{
				// validate target user
				h.Logger.Sugar().Infof("For message from %v, the target does not exist: %v", userCookie, message.Target)
				c.WriteJSON(SignalMessage{Type: "TARGET_NOT_FOUND"})
			} else {
				target := targetClient.(*UserClient)
				// update message with my username so that they know who to forward to next.
				forwardedMessage := NewForwardedSignalMessage(message, userCookie)
				// send message to target user.
				target.Inbox <- forwardedMessage
				h.Logger.Sugar().Infof("[%v] Target present: %v, forwarding message. type=%v", userCookie, message.Target, message.Type)
			}
		}
	})
}

func (h *ClientHandler) KickActiveUsers(ctx *fiber.Ctx) error {
	h.Logger.Info("Kicking all the active users")
	h.UserClientRegistry.AvailableUsers = sync.Map{}
	h.Logger.Info("Completed kick, reinitialized available users store")
	ctx.SendStatus(200)
	return nil
}

// Handler for request to register to this server
func (h *ClientHandler) Register(ctx *fiber.Ctx) error {
	h.Logger.Info("ClientHandler: Register")
	req := new(RegisterRequest)
	if err := ctx.BodyParser(req); err != nil {
		h.Logger.Sugar().Errorf("Unable to parse body for Register: %+v", err)
		ctx.SendStatus(400)
		return ctx.JSON(RegisterResponse{Status: RegisterStatus_Invalid, Message: "invalid body"})
	}
	// validate request (username conforms with requirements for this project)
	if req.Username == "" {
		ctx.SendStatus(400)
		return ctx.JSON(RegisterResponse{Status: RegisterStatus_Invalid, Message: "username cannot be empty"})
	}

	// validate if user exists, if not add them to register (atomically)
	_, loaded := h.UserStore.Users.LoadOrStore(req.Username, struct{}{})
	if loaded {
		h.Logger.Sugar().Debugf("Username already taken: %v", req.Username)
		ctx.SendStatus(200)
		return ctx.JSON(RegisterResponse{Status: RegisterStatus_Taken})
	}
	h.Logger.Sugar().Infof("Creating entry for new user: %v", req.Username)

	// create cookie containing session/user info
	userCookie := fasthttp.AcquireCookie()
	userCookie.SetKey("user_username")
	userCookie.SetValue(req.Username)
	userCookie.SetPath("/")
	ctx.Response().Header.SetCookie(userCookie)
	fasthttp.ReleaseCookie(userCookie)

	return ctx.JSON(RegisterResponse{Status: RegisterStatus_Success})
}

// Request and Response Messages

type RegisterRequest struct {
	Username string `json:"username"`
}

type RegisterResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

// For HTTP Messages
const (
	RegisterStatus_Success = "SUCCESS"
	RegisterStatus_Taken   = "TAKEN"
	RegisterStatus_Invalid = "INVALID"
)

// For Websocket messages
const (
	ConnectStatus_Unauthenticated = "UNAUTHENTICATED"
	ConnectStatus_AlreadyExists = "ALREADY_EXISTS"
)
