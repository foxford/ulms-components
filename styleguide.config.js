const path = require('path')
const fs = require('fs')
const cssenv = require('postcss-preset-env');
const autoprefixer = require('autoprefixer');

const { directories } = require('./package.json')

module.exports = {
  pagePerSection: true,
  components: 'src/packages/**/[A-Za-z]*.js',
  require: [
    'babel-polyfill'
  ],
  webpackConfig: {
    module: {
      rules: [
        // Babel loader, will use your project’s .babelrc
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        // Other loaders that are needed for your components
        {
          test: /\.css$/,
          include: /@foxford\/ui/,
          use: [
            'style-loader',
            { loader: 'css-loader', options: { importLoaders: 1 } },
            {
              loader: 'postcss-loader',
              options: {
                plugins: () => [cssenv(), autoprefixer()]
              }
            }
          ]
        },
        {
          enforce: 'pre',
          test: /\.css$/,
          exclude: /node_modules/,
          include: path.resolve(__dirname, 'src'),
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1 ,
                modules: true,
                localIdentName: '[name]-[hash:base64:5]',
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [cssenv(), autoprefixer()]
              }
            }
          ]
        }
      ]
    }
  }
}
