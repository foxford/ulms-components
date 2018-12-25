/* eslint-disable */
const alias = require('rollup-plugin-alias')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const cssnano = require('cssnano')
const cssnext = require('postcss-cssnext')
const cssurl = require('postcss-url')
const Debug = require('debug')
const env = require('postcss-preset-env')
const fs = require('fs')
const json = require('rollup-plugin-json')
const npm = require('rollup-plugin-node-resolve')
const postcss = require('rollup-plugin-postcss')
const scss = require('rollup-plugin-scss')
const svgr = require('@svgr/rollup').default
const uglify = require('rollup-plugin-uglify')

const { name } = require('./package.json')
const { postcssLoader } = require('./rollup/loaders')

const babelrc = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'))

const warn = console.warn
console.warn = (...argv) => process.env.LOG_WARN && Debug(`${name}:console.warn`)(...argv)
// monkeypatch warn method to disable annoying postcss warning

const globalDebug = Debug(`${name}:rollup.config.js`)

const uglifyOptions = {
  compress: {
    drop_console: true,
    pure_getters: true,
    unsafe_comps: true,
    warnings: false,
  },
}

const shouldMinifyCss = options => process.env.NODE_ENV === 'production' ? cssnano(options) : []

const shouldUglify = (options = uglifyOptions, minifier) => process.env.NODE_ENV === 'production' ? uglify(options, minifier) : []

const postcssPlugins = [
  cssurl({ url: 'inline' }),
  env(),
  cssnext()
].concat(shouldMinifyCss())

const rollupPlugins = [ // order matters
  json(),
  svgr(),
  postcss({
    extract: true,
    plugins: postcssPlugins,
    loaders: [
      {
        name: 'postcss',
        alwaysProcess: true,
        test: /\.css/,
        process (_) {
          if (
            /\.css/.test(this.id)
            && new RegExp(name).exec(this.id)
            && !(/@foxford\/ui/.exec(this.id))
          ) {
            this.options = {
              ...this.options, modules: true, namedExports: true,
            }
          }
          // :up is crucial to allow transpile local and external .css separately

          return postcssLoader.process.call(this, _)
        },
      },
    ],
  }),
  npm({
    browser: true,
    extensions: ['.js', '.jsx']
  }),
  cjs({
    include: 'node_modules/**',
    namedExports: {
      'react-sizeme': ['SizeMe']
    }
  }),
  babel({
    babelrc: false,
    presets: babelrc.env.packages.presets,
    plugins: [
      ...babelrc.plugins,
      ...babelrc.env.packages.plugins
    ]
  })
].concat(shouldUglify())

const dist = (entry, frm = 'src/packages', out = 'packages') => ({
  input: `${frm}/${entry}`,
  output: {
    file: `${out}/${entry}`,
    format: 'cjs',
  },
  file: `${out}/${entry}`, // that's important duplicate
  cache: true,
  perf: false,
  external: [
    'classnames',
    'js-cookie',
    'moment',
    'prop-types',
    'react-datepicker',
    'react-dom',
    'react-input-mask',
    'react-router-dom',
    'react'
  ],
  plugins: rollupPlugins,
  onwarn: function(warning, warn){
    if(!warning.code) return globalDebug(warning.message)

    const debug = Debug(`${name}:${warning.code}`)

    if(process.env.LOG_DEBUG) debug(warning)

    if(warning.code === 'UNKNOWN_OPTION'){
      if(process.env.LOG_DEBUG) debug(warning.message)
      return
    } else if(warning.code) {
      return debug(warning.message)
    }

    globalDebug(warning.message)
  }
})

exports.dist = dist

exports.default = dist()
