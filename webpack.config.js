module.exports = {
  entry: {app: './app/app'},

  devtool: 'source-maps',

  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: [/node_modules/]
    }]
  },
  node: {
    fs: 'empty'
  },
  output: {
    filename: './bundle.js',
    libraryTarget: 'umd',
    publicPath: '/'
  }

};
