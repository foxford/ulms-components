/* eslint-disable */
const alias = require('rollup-plugin-alias')
const babel = require('rollup-plugin-babel')
const cjs = require('rollup-plugin-commonjs')
const cssdupl = require('postcss-discard-duplicates')
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
const sourcemaps = require('rollup-plugin-sourcemaps')
const svgr = require('@svgr/rollup').default
const uglify = require('rollup-plugin-uglify')

const { name, peerDependencies } = require('./package.json')
const { postcssLoader } = require('./rollup/loaders')
const babelrc = require('./.babelrc.json')

const babel_rc = babelrc.env[process.env.BABEL_ENV || 'es']

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

const processAsCssModule = function(){
  this.options = {
    ...this.options, modules: true, namedExports: true,
  }
}

const rollupPlugins = [ // order matters
  json(),
  svgr(),
  postcss({
    extract: true,
    plugins: [
      cssurl({ url: 'inline' }),
      env(),
      cssnext(),
      cssdupl()
    ].concat(shouldMinifyCss()),
    loaders: [
      {
        name: 'postcss',
        alwaysProcess: true,
        test: /\.css$/,
        process (_) {
          if(/node_modules\/@foxford\/ui\/.*\.css$/.exec(this.id)){
            // do nothing as we going to import file as is
          } else if(/node_modules\/.*\.css$/.exec(this.id)){
            // do nothing as we going to import file as is
          } else {
            processAsCssModule.call(this)
            // process css as css-modules
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
    presets: babel_rc.presets,
    plugins: [
      ...babelrc.plugins,
      ...babel_rc.plugins
    ]
  }),
  sourcemaps()
].concat(shouldUglify())

const dist = (entry = 'index.js', frm = './', out = './es') => {
  const opts = ({
    input: `${frm}/${entry}`,
    output: {
      file: `${out}/${entry}`,
      format: 'es',
      sourcemap: true,
    },
    file: `${out}/${entry}`, // that's important duplicate
    external: Object.keys(peerDependencies),
    plugins: rollupPlugins,
    onwarn: function(warning, warn){
      if(!warning.code) return //globalDebug(warning.message)

      //const debug = Debug(`${name}:${warning.code}`)

      if(process.env.LOG_DEBUG) debug(warning)

      if(warning.code === 'UNKNOWN_OPTION'){
        //if(process.env.LOG_DEBUG) debug(warning.message)
        return
      } else if(warning.code) {
        //return debug(warning.message)
      }

      //globalDebug(warning.message)
    }
  })

  return opts
}

module.exports = dist()

// exports.dist = dist
