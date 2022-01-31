# Browser Camera Chat

Features Targets
- two peers to establish a peer to peer connection
	- They can exchange peer information via signal server to establish connection
	- They can exchange peer information by pasting in information to establish connection
- video filter options for the user.

## Developing and Running Locally

You need to have these three components running locally. You can find the required system and build dependencies in their `README.md`
- `web/`, the webpack server that serves the web app
- `signal-server/`, a message exchange server for clients to setup their RTC Connection to one another
- `proxy/`, gateway to the signal-server and the webapp. (for convenience) 


After you got all the components running, you can just go over to:
`localhost:10000/`
