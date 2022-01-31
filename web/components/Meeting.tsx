import React, { useEffect, useRef, useState } from "react";
import { SignalSession } from "utils/signalSession";
import { tryHandshake } from "utils/rtc";
import styles from "../styles/Meeting.module.css";
import FilterMenu from "components/FilterMenu";

interface MeetingProps {
  username: string;
  meetingId: string;
  method: "join" | "host";
}

// rate at which we will update the local canvas
const localFrameRate = 1000 / 30;
// rate at which we capture canvas to send to remote
const remoteFrameRate = 1000 / 25;

const Meeting = ({ username, meetingId, method }: MeetingProps) => {
  // where remote video is shown
  const remoteVideoElementMount = useRef(null);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>(
    new RTCPeerConnection()
  );
  const [signalSession, setSignalSession] = useState<
    SignalSession | undefined
  >();
  // setup Signal and Peer Connection
  useEffect(() => {
    let signalSession = new SignalSession(peerConnection);
    setSignalSession(signalSession);
    console.log("Setting up the RTCPeerConnection");

    // send local ice candidates to remote peer
    peerConnection.onicecandidate = function (
      ev: RTCPeerConnectionIceEventInit
    ) {
      console.log("Got local ice candidate, sending it to peer", ev);
      let iceCandidateDetails = {
        type: "ice-candidate",
        target: meetingId,
        payload: ev.candidate,
      };
      signalSession.sendMessage(iceCandidateDetails);
    };

    // on track from remote, hook track to the video element mount
    peerConnection.ontrack = function (ev: RTCTrackEvent) {
      console.log("Got track from peer connection", ev);

      if (!!remoteVideoElementMount.current) {
        console.log("Setting track as src for video");
        let remoteVideoMountElement: HTMLVideoElement =
          remoteVideoElementMount.current;
        remoteVideoMountElement.srcObject = ev.streams[0];
      }
    };

    // add handler to handle negotiation needed events.
    peerConnection.onnegotiationneeded = function () {
      console.log("Got negotiation needed event, handling handshaking");
      tryHandshake(method, meetingId, peerConnection, signalSession);
    };
  }, []);

  // wasm library to process video
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

  const [localVideoStream, setLocalVideoStream] = useState<MediaStream>();
  // retrieve videoStream from media device
  useEffect(() => {
    console.log("Setting up local video");
    window.navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        setLocalVideoStream(mediaStream);
        console.log("Retrieved video media stream");
      });
  }, []);

  const [selectedFilterType, setSelectedFilterType] = useState("noop");
  const [selectedFilter, setSelectedFilter] = useState(null);
  useEffect(() => {
    if (!!videoProcessorModule && !!selectedFilterType) {
      console.log(videoProcessorModule);
      let filter = new videoProcessorModule.NoopFilter();
      switch (selectedFilterType) {
        case "gray":
          filter = new videoProcessorModule.GrayscaleFilter();
          break;
        case "green":
          filter = new videoProcessorModule.GreenFilter();
          break;
      }
      console.log("Current filter is ", filter);
      setSelectedFilter(filter);
    }
  }, [selectedFilterType, videoProcessorModule]);

  const [videoMediaProxy, setVideoMediaProxy] = useState<any>();
  const localCanvasRefresherInterval = useRef();
  // where we draw computed frame
  const localVideoCanvas = useRef(null);
  const [localVideoCanvasHeight, setLocalVideoCannvasHeight] =
    useState<number>(0);
  const [localVideoCanvasWidth, setLocalVideoCannvasWidth] =
    useState<number>(0);

  // setup local video processing interval
  // add the local canvas as a media track, so that the peer can retrieve it as an icecandidate
  useEffect(() => {
    if (
      !!localVideoStream &&
      !!videoProcessorModule &&
      !!localVideoCanvas.current &&
      !!selectedFilter
    ) {
      console.log("Ready to setup local video.");
      let localCanvas: HTMLCanvasElement = localVideoCanvas.current;
      // then set the height and width of the local canvas
      let videoWidth =
        localVideoStream.getVideoTracks()[0].getSettings().width ?? 0;
      let videoHeight =
        localVideoStream.getVideoTracks()[0].getSettings().height ?? 0;

      setLocalVideoCannvasWidth(videoWidth);
      setLocalVideoCannvasHeight(videoHeight);
      const videoMediaProxy = videoProcessorModule.VideoMediaProxy.new(
        localVideoStream,
        localCanvas,
	videoHeight,
	videoWidth
      );

      setVideoMediaProxy(videoMediaProxy);

      // hook localCanvas as media track to peer Connection
      let localCanvasStream: MediaStream =
        localCanvas.captureStream(remoteFrameRate);
      let localCanvasTracks = localCanvasStream.getVideoTracks();
      if (localCanvasTracks.length > 0) {
        let localCanvasTrack = localCanvasTracks[0];
        peerConnection.addTrack(localCanvasTrack, localCanvasStream);
      } else {
        console.error(
          "There aren't any tracks in canvas, can't add track to peerConnection."
        );
      }

      const localCanvasRefresherId = setInterval(() => {
        // retrieves next frame and then processes the frame
        // processed frame is sent to the canvas
        let frame = videoMediaProxy.get_frame();
        if (!!frame) {
          let processedFrame: ImageData = selectedFilter.generate_frame(frame);
          localCanvas.getContext("2d").putImageData(processedFrame, 0, 0);
        }
      }, localFrameRate);
      localCanvasRefresherInterval.current = localCanvasRefresherId;

      return () => {
        // cancel the existing refresher
        clearInterval(localCanvasRefresherInterval.current);
      };
    }
  }, [localVideoStream, videoProcessorModule, selectedFilter]);

  return (
    <>
      <div>Connecting to meeting: {meetingId}</div>
      <div className={styles.videoContainer}>
        <canvas
          id="localVideo"
          width={localVideoCanvasWidth}
          height={localVideoCanvasHeight}
          ref={localVideoCanvas}
        ></canvas>
        <video
          controls
          autoPlay
          playsInline
          id="remoteVideo"
          ref={remoteVideoElementMount}
        ></video>
      </div>
      <p>Active Filter: {selectedFilterType}</p>
      <FilterMenu onFilterTypeSelect={setSelectedFilterType} />
    </>
  );
};

export default Meeting;
