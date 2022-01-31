# WebRTC Video Chat Application

## What is this web application?

A peer to peer video chat application that uses WebRTC.

This web application is a client that will setup an RTC Peer Connection to a remote peer.
There are two options for connecting with a remote peer
- using a signal server to exchange peer information
- manually entering remote peer description (which can be exchanged some other way, i.e carrier pigeon) (Not Yet Implemented)

There are additional features to the video chat, such as:
- applying filters to frames
- ...

### Pages

#### `/register`

If the user wishes to connect to peers via signaling, this page will setup the user with an identity from the backend store (the signal server)

By registering, the user will be reachable for signaling when they are in the `/meeting` page and ready to join/host a meeting.

#### `/home`

Where the user can decide whether they wish to join/host a meeting

#### `/meeting`
This page is reachable via `/home`.
This page is where the video chat application exists.

For input, this page takes in the meeting Id (which currently is the target user) and role (host/join)

## Requirements

- `node` (get `nvm` as well)
- `wasm-pack`
  - Instructions can be found here: [wasm-pack/docs](https://rustwasm.github.io/docs/wasm-pack/prerequisites/index.html)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

If you don't have the the `proxy/` running, you can hit the app directly
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
Otherwise open the app via proxy
- Open [http://localhost:10000](http://localhost:10000) with your browser to see the result.

## What Libraries are in this repository?

### `video-processor`

This is a WASM library that will process video frame data from the user's camera device.
It supports the following:
- read from media stream of the device and returns a frame
- filter functions that will compute new frames.
  - Currently for a given frame, the filter will
    - Compute grayscale image
    - Compute a green image
  - In the future we want to
    - do edge detection
    - <insert other Computer Vision Algorithms>


## Project Setup

This app is powered by Next.js.

In order for the `video-processor` library to compile along with this application, refer to the `next.config.js` for the plugin configuration.
By using WasmPack Plugin, we don't need to manually recompile the wasm library. Hot reloading can do it's job.

### Additional references
- Explanation of the Next CLI can be found here: https://nextjs.org/docs/api-reference/cli
