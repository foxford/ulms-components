const { name } = require('./package.json')
const { promisify } = require('util')
const { rollup } = require('rollup')
const concurrently = require('concurrently')
const Debug = require('debug')
const fs = require('fs')
const mkdirp = require('mkdirp')
const ncp = require('ncp')
const path = require('path')

const { dist } = require('./rollup.config')

const debug = Debug(`${name}:rollup.js`)

const src = 'src/packages'
const out = 'packages'
const packages = path.resolve(__dirname, src)
const packagesOut = path.resolve(__dirname, out)

const WHITELIST = !process.env.WHITELIST ? [] : process.env.WHITELIST.split(',').map(it => it.toLowerCase())
debug('Whitelist:', WHITELIST)

const readDir = promisify(fs.readdir)
const copyDir = promisify(ncp.ncp)
const copyFile = promisify(fs.copyFile)
const mkDir = promisify(mkdirp)

const matchScript = it => it.includes('.js')
const matchImage = it => it.includes('/images')

async function processOne(entry){
  debug(entry)
  const conf = dist(entry, src, out)

  const match = entry.match(/\.json$/ig)
  if(match && match.length) return processJson(entry)

  const result = await rollup(conf)

  return result.write(conf);
}

async function processJson(entry){
  const dest = `${packagesOut}/${entry}`;

  let destpath = dest.split('/');
  destpath.pop()
  destpath = destpath.join('/')

  await mkDir(destpath)

  return copyFile(`${packages}/${entry}`, dest)
}

async function processImageFolder(entry){
  debug(entry)
  const outdir = path.resolve(__dirname, out) + '/' + entry

  await mkDir(outdir)

  return copyDir(packages + '/' +  entry, outdir)
}

readDir(packages)
  .then(result => result.filter(it => !it.includes('.')))
  .then(result => !WHITELIST.length ? result : result.filter(it => WHITELIST.includes(it.toLowerCase())))
  .then(async (parents) => {
    const children = parents.map(it => {return readDir(`${packages}/${it}`)})

    const result = await Promise.all(children)

    const results = parents.reduce((acc, next, i) => {
      const list = result[i].map(it => next + '/' + it)
      return acc.concat(list)
    }, [])

    return results
  })
  .then(x => [].concat(x.filter(matchImage), x.filter(matchScript)))
  .then(result => {
    const resolveScripts = it => it.map(processOne)
    const resolveImages = it => it.map(processImageFolder)

    const payload = [].concat(
      resolveImages(result.filter(matchImage)),
      resolveScripts(result.filter(matchScript)),
    )

    return Promise.all(payload)
  })
  .then(() => {
    console.log('Successfully processed')
    process.exit(0)
  })
  .catch(e => {
    console.error(e)
    process.exit(0)
  })
