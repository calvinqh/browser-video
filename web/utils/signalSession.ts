function handleOpen(e: Event) {
  console.log("Connection has been opened");
  console.dir(e);
}

function handleClose(e: CloseEvent) {
  console.log("Connection has been closed");
  console.dir(e);
}

function handleError(e: Event) {
  console.log("Got an error for the ws connection.");
  console.dir(e);
}

export function createSignalSession(): WebSocket {
  let signalServer = "ws://localhost:10000/api/v1/connect";
  let connection = new WebSocket(signalServer);
  connection.onopen = handleOpen;
  connection.onclose = handleClose;
  connection.onerror = handleError;

  return connection;
}

export class SignalSession {
  signalConnection: WebSocket;
  rtcConnection: RTCPeerConnection;

  constructor(
    rtcConnection: RTCPeerConnection,
    signalServer = "ws://localhost:10000/api/v1/connect"
  ) {
    this.rtcConnection = rtcConnection;
    this.signalConnection = new WebSocket(signalServer);
    this.signalConnection.onopen = (e: Event) =>
      console.log("Conneciton has been open");
    this.signalConnection.onclose = (e: CloseEvent) => {
      console.log("Connection closed");
    };
    this.signalConnection.onmessage = async (ev: MessageEvent) => {
      let message = JSON.parse(ev.data);
      if (message.type === "video-answer") {
        // update rtcConnection with peer description
        const remoteDesc = new RTCSessionDescription(message.payload);
        await this.rtcConnection.setRemoteDescription(remoteDesc);
        console.log("Got answer from", message.originator);
      } else if (message.type === "video-offer") {
        const remoteDescription = new RTCSessionDescription(message.payload);
        console.dir(rtcConnection);
        console.log("Trying to set remote description");
        rtcConnection.setRemoteDescription(remoteDescription);
        console.log("Successfully set remote description");

        // create answer to offer and send it back to the peer
        const answer = await this.rtcConnection.createAnswer();
        await this.rtcConnection.setLocalDescription(answer);
        this.signalConnection.send(
          JSON.stringify({
            target: message.originator,
            type: "video-answer",
            payload: answer,
          })
        );
        console.log("Got offer, sending answer back to", message.originator);
      } else if (message.type === "ice-candidate") {
        // add peer iceCandidate to rtcConnection
        try {
          console.log("Got ice-candidate from", message.originator);
          await this.rtcConnection.addIceCandidate(message.payload);
        } catch (e) {
          console.error("Error adding the received ice candidate", e);
        }
      }
    };
  }

  sendMessage(msg: any): void {
    if (this.signalConnection.readyState === WebSocket.OPEN) {
      this.signalConnection.send(JSON.stringify(msg));
      //console.log("Successfully sent message!");
    } else {
      console.log("Connection not ready yet, won't send message");
      setTimeout(() => this.sendMessage(msg), 500);
    }
  }
}
