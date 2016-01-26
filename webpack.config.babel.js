import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  devtool: 'cheap-module-inline-eval-source-map',
  entry:   [
    'eventsource-polyfill', // necessary for hot reloading with IE
    'webpack-hot-middleware/client',
    './src/index',
  ],
  output:  {
    path:       '/',
    filename:   'bundle.js',
    publicPath: '',
  },
  plugins: [
    new webpack.ProvidePlugin({
      $:               'jquery',
      jQuery:          'jquery',
      'window.jQuery': 'jquery',
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      mobile:   true,
      template: 'template.html',
    }),
  ],
  module:  {
    loaders: [
      {
        test:    /\.js$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src'),
      },
      {
        test:    /\.scss/,
        loaders: ['style', 'css', 'sass'],
      },
      {
        test:    /\.jpg/,
        loaders: ['file'],
      },
      {
        test:    /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loaders: ['url?limit=10000&minetype=application/font-woff'],
      },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loaders: ['file'] },
    ],
  },
};
