import { useEffect, useState } from "react";

interface ChatProps {
  username: string;
}

function videoTicker(video: any) {
  video.tick();
  //setTimeout(() => videoTicker(video), 1000);
  setTimeout(() => videoTicker(video), 0);
}

const Chat = ({ username }: ChatProps) => {
  const [session, setSession] = useState<WebSocket | undefined>();
  const [localVideo, setLocalVideo] = useState<any>();

  const [videoProcessorModule, setVideoProcessorModule] = useState<
    WebAssembly.Module | undefined
  >(undefined);

  // load of the wasm module once.
  useEffect(() => {
    console.log("Loading video-processor module.");
    import("video-processor/pkg").then((compiledModule) => {
      setVideoProcessorModule(compiledModule);
      console.log("Successfully loaded video-processor module");
    });
  }, []);

  // setup the local video
  useEffect(() => {
    if (!!videoProcessorModule) {
      console.log("Setting up local video");
      window.navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((mediaStream) => {
          console.log("mediaStream", mediaStream);
          let msWidth = mediaStream.getVideoTracks()[0].getSettings().width;
          let msHeight = mediaStream.getVideoTracks()[0].getSettings().height;

          let localVideoMountPoint =
            window.document.querySelector("canvas#localVideo");
          localVideoMountPoint.width = msWidth;
          localVideoMountPoint.height = msHeight;
          let localVideo = new videoProcessorModule.LocalMediaProxy.new(
            mediaStream,
            localVideoMountPoint
          );
          localVideo.set_intermediary_context_size(msWidth, msHeight);

          setLocalVideo(localVideo);
          console.log("Completed local video setup");
        });
    }
    // hook up mediaDevices and canvas
  }, [videoProcessorModule]);

  // run the local video onto the canvas
  useEffect(() => {
    if (!!localVideo) {
      videoTicker(localVideo);
    }
  }, [localVideo]);

  // setup connection to the ws server once.
  useEffect(() => {
    console.log("Establishing connection to signal server");
    // create ws connection to signal server
    let signalServer = "ws://localhost:10000/api/v1/connect";
    let connection = new WebSocket(signalServer);
    connection.onopen = function (e: Event) {
      console.log("Connection has been opened");
      console.dir(e);
    };
    connection.onclose = function (e: CloseEvent) {
      console.log("Connection has been closed");
      console.dir(e);
    };
    connection.onmessage = function (e: MessageEvent) {
      console.log("Got a message");
      console.dir(e);
    };
    connection.onerror = function (e: Event) {
      console.log("Got an error for the ws connection.");
      console.dir(e);
    };
    setSession(connection);
    console.log("Connection/session setup completed to signal server.");
  }, []);

  return (
    <>
      <div>Hello, {username}</div>
      <div>
        <h1>Users Available</h1>
        <ul>
          <li></li>
        </ul>
      </div>
      <div>
        <canvas id="localVideo"></canvas>
        <video controls autoPlay playsInline id="testLocalVideo"></video>
      </div>
    </>
  );
};

export default Chat;
