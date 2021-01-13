const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");
const externals = require('./package.json').dependencies;

process.env.NODE_ENV = 'production';
module.exports = {
  devtool: 'cheap-source-map',
  mode: 'production',
  target: 'electron-main',
  entry: path.resolve(__dirname, './main/index.js'),
  output: {
    path: path.join(__dirname, './app'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  externals: [...Object.keys(externals || {})],
  module: {
    rules: [
      {
        test: /\.(js|mjs|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: ['node_modules']
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          ecma: undefined,
          warnings: false,
          parse: {},
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log']
          },
        },
      })
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, './package.json'),
          to: path.join(__dirname, './app')
        }
      ]
    })
  ],
  node: {
    __dirname: false,
    __filename: false
  }
}