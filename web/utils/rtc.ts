import { SignalSession } from "./signalSession";

export function tryHandshake(
  method: string,
  meetingId: string,
  peerConnection: RTCPeerConnection,
  signalSession: SignalSession
) {
  if (method === "join") {
    console.log("Kicking off handshaking");
    peerConnection.createOffer().then((offer) => {
      peerConnection.setLocalDescription(offer);
      let offerDetails = {
        type: "video-offer",
        target: meetingId,
        payload: offer,
      };
      signalSession.sendMessage(offerDetails);
    });
  } else {
    console.log("No handshaking logic required for method:", method);
  }
}
