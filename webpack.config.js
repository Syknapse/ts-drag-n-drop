const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'dist' /* Needed so webpack-dev-server knows to look in dist and save the bundle to memory */,
  },
  devtool: 'inline-source-map' /* Tells webpack we have generated source maps (from tsconfig) to show in devtools */,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
}
