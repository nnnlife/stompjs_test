const path = require('path');
const copyPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new copyPlugin({
        patterns: [
            { from: path.resolve(__dirname, 'src', '*.html'),
              to: '[name][ext]',
              noErrorOnMissing: true
            },
            { from: path.resolve(__dirname, 'src', '*.css'),
              to: '[name][ext]',
              noErrorOnMissing: true
            },

        ],
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'out'),
  },
};
