const path = require('path');
module.exports = {
  mode: 'development',
  entry: path.join(__dirname, '#src/js/script.js'),
  watch: true,
  output: {
    path: path.join(__dirname, '#src/js'),
    filename: "bundle.js"
  },
  module: {
    rules: [{
      test: /\.m?js$/,
      exclude: [
        path.resolve(__dirname, 'node_modules')
      ],
      loader: 'babel-loader',
      query: {
        presets: [
          ['@babel/preset-env', {
            debug: true,
            corejs: 3,
            useBuiltIns: "usage"
          }]
        ]
      }
    }]
  },
  devtool: 'source-map'
};