import path from 'path';
import webpack from 'webpack';

export default {
  entry:   [
    './src/index',
  ],
  output:  {
    path:     path.join(__dirname, 'dist'),
    filename: 'websocket_rails.js',
    libraryTarget: 'umd',
    library: 'WebSocketRails',
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false,
      },
    }),
  ],
  module:  {
    loaders: [
      {
        test:    /\.js$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src'),
      },
    ],
  },
};
