'use strict';

const Path = require('path');
const Fs = require('fs');

const Clean = require('clean-webpack-plugin');
const Compress = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Webpack = require('webpack');

const AutoPrefixer = require('autoprefixer-stylus');
const Axis = require('axis');
const Rupture = require('rupture');

const plugins = [];

plugins.push(new Webpack.optimize.UglifyJsPlugin({
  compress: {
    warnings: false
  }
}));
plugins.push(new Clean(['build']));
plugins.push(new Webpack.optimize.OccurenceOrderPlugin(true));
plugins.push(new Compress({
  regExp: /\.js$/
}));
plugins.push(new HtmlWebpackPlugin({
  templateContent: function (templateParams, compilation) {
    const path = templateParams.htmlWebpackPlugin.files.chunks.main.entry;
    const template = Fs.readFileSync('layout.template', 'utf8');

    return template.replace('{{BUNDLE_NAME}}', path);
  },
  filename: 'layout.jade'
}));

module.exports = {
  context: Path.join(process.cwd(), 'assets'),
  entry: {
    main: ['./style/main']
  },
  output: {
    path: './build',
    filename: '[hash]-[name].js'
  },
  module: {
    loaders: [{
      test: /\.styl$/,
      include: Path.resolve(process.cwd(), 'assets'),
      loader: 'style!css!stylus?paths=node_modules/jeet/stylus/'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.styl'],
    modulesDirectories: ['node_modules']
  },
  stylus: {
    use: [Rupture(), Axis(), AutoPrefixer({
      browsers: ['> 10%', 'Last 2 versions']
    })]
  },
  plugins: plugins
};
