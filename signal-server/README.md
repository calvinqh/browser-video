# Signal Server

A websocket server that
- allows clients to register and get an identity
- clients to foward and trade information in order to establish their RTC connection

## APIs
You can check the `main.go` for the routes.

### Core API
Used by the web application

#### `POST /v1/register`
Clients use this endpoint to register an identity with the server
```
type RegisterRequest {
  username: string
}
```

#### `GET /v1/connect`
Where registered users can establish a websocket connection.
By connecting, clients make themselves reachable by other clients.

This connection is for clients to exchange RTCPeerConnection information (descriptions, ice candidates)

Users specify the target peer they wish to have their information forwarded to.

##### Format of Message Sent:
```
type Message {
  target: string        // the user the message will be forwarded to
  type: string          // used by the client to determine what typ eof message this is
  payload: any/string   // raw message with payload contents
}
```

##### Format of Message Recieved:
```
type ForwardedMessage {
  target: string
  type: string
  originator: string    // who sent the message
  payload: any/string
}
```

#### `GET /v1/user`
This is supposed to be a simple endpoint to test whether a user' session is logged in.
If the user cookie is invalid, a 404 is returned and clears user's cookies. Otherwise a 200 is returned.

It expects `user_username` cookie to be present. If this cookie doesn't exist in the user store, it will return a 404 and clear the users cookie



### Admin API
Used to help test the api (i.e list users and clear data)

#### `GET /v1/kick-active-users`
Clears the active users from memory. Thus forcing them to reconnect. Since there can only be 1 active connection per user, this is useful when refresing the `/meeting` page.


## Components
`UserClientRegistry`
- Users that are active (available to recieve messages)

`UserStore`
- The users that have registered an identity


## Requirments
* go (https://golang.org/doc/install)

## Quick start
```
go run main.go
```

You can then hit the server either by:
- The proxy via http://localhost:10000/api
- The server directly via http://localhost:8000/
