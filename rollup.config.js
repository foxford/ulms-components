const { name } = require('./package.json')
const alias = require('rollup-plugin-alias')
const autoprefixer = require('autoprefixer')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const cssnano = require('cssnano')
const cssurl = require('postcss-url')
const Debug = require('debug')
const env = require('postcss-preset-env')
const json = require('rollup-plugin-json')
const npm = require('rollup-plugin-node-resolve')
const path = require('path')
const postcss = require('rollup-plugin-postcss')
const scss = require('rollup-plugin-scss')
const uglify = require('rollup-plugin-uglify')

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
  autoprefixer()
].concat(shouldMinifyCss())

const rollupPlugins = [ // order matters
  json(),
  postcss({
    modules: true,
    extract: true,
    namedExports: true,
    plugins: postcssPlugins
  }),
  npm({ browser: true }),
  cjs({
    include: 'node_modules/**'
  }),
  babel({})
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

    if(warning.code == 'UNKNOWN_OPTION'){
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
