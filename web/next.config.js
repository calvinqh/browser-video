/** @type {import('next').NextConfig} */
const { resolve } = require("path");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  webpack: (config, options) => {
    config.plugins.push(
      new WasmPackPlugin({
        crateDirectory: resolve("./video-processor"),
        args: "--log-level warn",
        forceMode: "production",
      })
    );

    // From https://github/rustwasm/wasm-pack/issues/835#issuecomment-772591665
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/sync",
    });
    config.experiments = {
      syncWebAssembly: true,
      //topLevelAwait: true,
      //asyncWebAssembly: true,
    };

    return config;
  },
  reactStrictMode: true,
};
