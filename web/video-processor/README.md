# Video Processor

API to provide video processing

## Features

### Filters

- Grayscale

### Computer Vision

- Edge Dectection

## (Optional) Building

If you wish to manually build this module. Make sure you have the following installed

- `wasm-pack`
  - Instructions can be found here: [wasm-pack/docs](https://rustwasm.github.io/docs/wasm-pack/prerequisites/index.html)

### Instructions

1. Install wasm package locally

```
wasm-pack build
```

### Optional Steps

1 If you want to make this module linkable for web apps locally: create NPM link

```
cd pkg/      //this is where build output is.
npm link
```

2. Install your deps for webapp

```
cd <your web app>/
npm i
```

3. Link the module to your app. If you check `node_modules/`, there should be a symlink to the `pkg/` folder.

```
npm link video-processor
```
