// webpack.config.js

const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "querystring": require.resolve("querystring-es3"),
      "fs": false, // fs n'est pas utilisable côté client
      "net": false, // net n'est pas utilisable côté client
      "http": require.resolve("stream-http")
    }
  }
};