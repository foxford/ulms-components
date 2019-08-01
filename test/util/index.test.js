const tap = require('tap')

const { Debug } = require('../../src/util/index')

tap.test('`Debug` helper is generally ok', (test) => {
  const p = Promise.resolve(() => Debug()).then(fn => fn())

  tap.rejects(p, new TypeError('Namespace should be a string'))
  test.end()
})

tap.test('`Debug` helper on production', (test) => {
  const oldEnv = process.env.NODE_ENV

  process.env.NODE_ENV = 'production'

  const stderr = Debug('some_namespace')

  tap.same(stderr(), undefined)
  tap.same(stderr('smth'), undefined)

  Object.assign(process.env, { NODE_ENV: oldEnv })

  test.end()
})
