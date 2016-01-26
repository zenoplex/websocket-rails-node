import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ExtractTextWebpackPlugin from 'extract-text-webpack-plugin';

export default {
  entry:   [
    './src/index',
  ],
  output:  {
    path:     path.join(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.ProvidePlugin({
      $:               'jquery',
      jQuery:          'jquery',
      'window.jQuery': 'jquery',
    }),
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
    new HtmlWebpackPlugin({
      filename: 'index.html',
      mobile:   true,
      template: 'template.html',
      minify:   {
        collapseWhitespace: true,
      },
    }),
    new ExtractTextWebpackPlugin('styles.css'),
  ],
  module:  {
    loaders: [
      {
        test:    /\.js$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'src'),
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
      { test: /\.scss$/, loader: ExtractTextWebpackPlugin.extract('style', 'css', 'sass') },
    ],
  },
};
