/* eslint-disable import/no-extraneous-dependencies */
import fs from 'node:fs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'
import svgr from '@svgr/rollup'
import postcss from 'rollup-plugin-postcss'
import postcssEnv from 'postcss-preset-env'
import postcssUrl from 'postcss-url'

const { main, module, peerDependencies } = JSON.parse(
  fs.readFileSync('./package.json', 'utf8'),
)

const commonjsOptions = {
  ignoreGlobal: true,
  include: [
    /node_modules/,
    'src/dist/*', // @ulms/ui-grid case only
  ],
}
const extensions = ['.js', '.jsx']
const nodeOptions = { browser: true, extensions }
const babelOptions = {
  babelHelpers: 'runtime',
  configFile: '../../babel.config.js',
  exclude: /node_modules/,
  extensions,
}
const replaceOptions = {
  preventAssignment: true,
  'process.env.NODE_ENV': JSON.stringify('production'),
}
const postcssOptions = {
  extract: true,
  minimize: true,
  plugins: [postcssUrl({ url: 'inline' }), postcssEnv()],
}
const svgrOptions = { dimensions: false }

export default {
  input: `./${main}`,
  external: Object.keys(peerDependencies),
  output: {
    file: `./${module}`,
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    json(),
    svgr(svgrOptions),
    postcss(postcssOptions),
    replace(replaceOptions),
    commonjs(commonjsOptions),
    nodeResolve(nodeOptions),
    babel(babelOptions),
    terser(),
  ],
}
