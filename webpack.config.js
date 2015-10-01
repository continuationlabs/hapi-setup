var Path = require('path');

var Clean = require('clean-webpack-plugin');
var Compress = require('compression-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin')
var Webpack = require('webpack');

var AutoPrefixer = require('autoprefixer-stylus');
var Axis = require('axis');
var Rupture = require('rupture');

var plugins = [];

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
    var path = templateParams.htmlWebpackPlugin.files.chunks.main.entry;
    return 'script(src="#{root}/public/' + path + '", type="text/javascript")'
  },
  filename: 'script.jade'
}))

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
    use: [Rupture(), Axis(), AutoPrefixer()]
  },
  plugins: plugins
};
