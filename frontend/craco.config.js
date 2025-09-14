const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "util": require.resolve("util/"),
        "url": require.resolve("url/"),
        "assert": require.resolve("assert/"),
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "process": require.resolve("process/browser.js"),
        "buffer": require.resolve("buffer")
      };

      // Add plugins
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser.js',
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env)
        })
      ];

      return webpackConfig;
    },
  },
};
