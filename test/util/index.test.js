const tap = require('tap')

const { Debug } = require('../../src/util/index')

tap.test('`Debug` helper is generally ok', (test) => {
  Promise.resolve(() => Debug())
    .then(fn => fn())
    .catch((error) => {
      tap.throws(error)
    })

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
