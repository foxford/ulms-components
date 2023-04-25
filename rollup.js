const { promisify } = require('util')
const { rollup } = require('rollup') // eslint-disable-line import/no-extraneous-dependencies
const Debug = require('debug')
const fs = require('fs')
const mkdirp = require('mkdirp') // eslint-disable-line import/no-extraneous-dependencies
const ncp = require('ncp') // eslint-disable-line import/no-extraneous-dependencies
const path = require('path')

const dist = require('./rollup.config')
const { name } = require('./package.json')

const debug = Debug(`${name}:rollup.js`)

const src = 'src/packages'
const out = 'packages-v0'
const packages = path.resolve(__dirname, src)
const packagesOut = path.resolve(__dirname, out)

const extractArg = function extractArgument (argName) {
  const fromArgv = (it) => {
    const pattern = `^${it}=(.*)$`
    const exist = process.argv.findIndex(_ => new RegExp(pattern).exec(_))

    if (~exist && !process.argv[exist]) throw new Error('Argument is absent')

    return !~exist ? undefined : process.argv[exist].match(new RegExp(pattern))[1]
  }
  const arg = process.env[argName]

  return !arg ? fromArgv(argName) : arg
}

const WHITELIST = (maybeList => !maybeList ? [] : maybeList.split(',').map(it => it.toLowerCase()))(extractArg('WHITELIST'))

debug('Whitelist:', WHITELIST)

const readDir = promisify(fs.readdir)
const copyDir = promisify(ncp.ncp)
const copyFile = promisify(fs.copyFile)
const mkDir = promisify(mkdirp)

const matchScript = it => it.endsWith('.js') || it.endsWith('.jsx')
const matchImage = it => it.includes('/images')

async function processJson (entry) {
  const dest = `${packagesOut}/${entry}`

  let destpath = dest.split('/')

  destpath.pop()
  destpath = destpath.join('/')

  await mkDir(destpath)

  return copyFile(`${packages}/${entry}`, dest)
}

async function processOne (entry) {
  debug(entry)
  const conf = dist(entry, src, out)

  const match = entry.match(/\.json$/ig)
  if (match && match.length) return processJson(entry)

  const result = await rollup(conf)

  return result.write(conf)
}

async function processImageFolder (entry) {
  debug(entry)
  const outdir = `${path.resolve(__dirname, out)}/${entry}`

  await mkDir(outdir)

  return copyDir(`${packages}/${entry}`, outdir)
}

const transpilePackages = function transpilePackages (dirNames) {
  const children = dirNames.map(it => readDir(`${packages}/${it}`))

  return Promise.all(children)
    .then(result => dirNames.reduce((acc, next, i) => {
      const list = result[i].map(it => `${next}/${it}`)

      return acc.concat(list)
    }, []))
    .then(x => [].concat(x.filter(matchImage), x.filter(matchScript)))
    .then((result) => {
      const resolveScripts = it => it.map(processOne)
      const resolveImages = it => it.map(processImageFolder)

      const payload = [].concat(
        resolveImages(result.filter(matchImage)),
        resolveScripts(result.filter(matchScript)),
      )

      return Promise.all(payload)
    })
}

Promise.resolve(WHITELIST[0])
  .then((packageName) => {
    if (!packageName) throw new Error(`Could not process '${packageName}' package`)

    return [packageName]
  })
  .then(transpilePackages)
  .then(() => {
    console.log(`Successfully process '${WHITELIST[0]}' package`) // eslint-disable-line no-console

    return process.exit(0) // eslint-disable-line unicorn/no-process-exit
  })
  .catch((error) => {
    console.error(error.message) // eslint-disable-line no-console
    debug('Transpiling error:', error.stack)

    process.exit(1) // eslint-disable-line unicorn/no-process-exit
  })
