/* eslint-disable */
const cssdupl = require('postcss-discard-duplicates')
const cssnext = require('postcss-cssnext')
const cssurl = require('postcss-url')
const Debug = require('debug')
const env = require('postcss-preset-env')
const svgr = require('@svgr/rollup')
const strip = require('@rollup/plugin-strip')
const terser = require('@rollup/plugin-terser')
const json = require('@rollup/plugin-json')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const { babel } = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')
const postcss = require('rollup-plugin-postcss')
const cssnano = require('cssnano')

const { name, peerDependencies } = require('./package.json')
const { postcssLoader } = require('./rollup/loaders')
const babelrc = require('./.babelrc.json')

const babel_rc = babelrc.env[process.env.BABEL_ENV || 'es']

// const warn = console.warn
console.warn = (...argv) => process.env.LOG_WARN && Debug(`${name}:console.warn`)(...argv)
// monkeypatch warn method to disable annoying postcss warning

// const globalDebug = Debug(`${name}:rollup.config.js`)

const shouldMinifyCss = options => process.env.NODE_ENV === 'production' ? cssnano(options) : []

const shouldUglify = options => process.env.NODE_ENV === 'production' ? [terser(options), strip({
  functions: ['console.log', 'assert.*'], // Убираем только console.log, warn и error оставляем!
})] : []

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
  nodeResolve({
    browser: true,
    extensions: ['.js', '.jsx']
  }),
  commonjs({
    include: 'node_modules/**',
    namedExports: {
      'react-sizeme': ['SizeMe'],
      'fabric': ['fabric']
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
    onwarn: function(warning){
      if(!warning.code) return //globalDebug(warning.message)

      //const debug = Debug(`${name}:${warning.code}`)

      // if(process.env.LOG_DEBUG) debug(warning)

      if(warning.code === 'UNKNOWN_OPTION'){
        //if(process.env.LOG_DEBUG) debug(warning.message)
        // return
      } else if(warning.code) {
        //return debug(warning.message)
      }

      //globalDebug(warning.message)
    }
  })

  return opts
}

module.exports = dist
