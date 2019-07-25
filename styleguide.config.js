/* eslint-disable import/no-extraneous-dependencies */
const cssdedupe = require('postcss-discard-duplicates')
const cssenv = require('postcss-preset-env')
const cssnext = require('postcss-cssnext')
const path = require('path')

const babelrc = require('./.babelrc.json')

module.exports = {
  pagePerSection: true,
  components: 'src/packages/**/[A-Za-z]*.jsx',
  require: ['@babel/polyfill', path.join(__dirname, 'src/misc/styleguide/components.jsx')],
  webpackConfig: {
    bail: true,
    module: {
      rules: [
        // Babel loader, will use your project’s .babelrc
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: babelrc.env.styleguidist,
          },
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
                plugins: () => [
                  cssenv(),
                  cssnext({
                    features: {
                      customProperties: false,
                    },
                  }),
                ],
              },
            },
          ],
        },
        {
          enforce: 'pre',
          test: /\.css$/,
          exclude: /node_modules\/(?!rc-slider)/ig,
          include: [path.resolve(__dirname, 'src'), /node_modules\/rc-slider/],
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: true,
                localIdentName: '[name]-[local]-[hash:base64:5]',
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [
                  cssenv(),
                  cssdedupe(),
                  cssnext({
                    features: {
                      customProperties: false,
                    },
                  }),
                ],
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },
      ],
    },
  },
}
