/* globals test, expect */
import { enrichUrlWith } from './enrich-url-with'

const type = 'iframe:about#taskdigests'

test('ok', () => {
  expect(enrichUrlWith(`${type}/path/to/page`, {}, type)).toBe(
    `${type}/path/to/page`,
  )
})

test('ok with origin', () => {
  expect(enrichUrlWith(`${type}/path/to/page`, {}, type, '//hello.world')).toBe(
    '//hello.world/path/to/page',
  )
})

test('ok with origin&params', () => {
  expect(
    enrichUrlWith(
      `${type}/path/to/page`,
      { foo: 'bar' },
      type,
      '//hello.world',
    ),
  ).toBe('//hello.world/path/to/page?foo=bar')
  // raw origin

  expect(
    enrichUrlWith(
      `${type}/path/to/page`,
      { foo: 'bar' },
      type,
      '//hello.world/to/another/world',
    ),
  ).toBe('//hello.world/to/another/world/path/to/page?foo=bar')
  // origin with path

  expect(
    enrichUrlWith(
      `${type}/path/to/page`,
      { foo: 'bar' },
      type,
      '//hello.world?john=doe',
    ),
  ).toBe('//hello.world/path/to/page?john=doe&foo=bar')
  // origin with get-params

  expect(
    enrichUrlWith(
      `${type}/path/to/page`,
      { foo: 'bar' },
      type,
      '//hello.world?john=doe#fizzbuzz',
    ),
  ).toBe('//hello.world/path/to/page?john=doe&foo=bar#fizzbuzz')
  // origin with getp-params and hash

  expect(
    enrichUrlWith(
      `${type}/to/page`,
      { foo: 'bar' },
      type,
      '//hello.world/path?john=doe#fizzbuzz',
      true,
    ),
  ).toBe('//hello.world/path?john=doe&foo=bar#fizzbuzz')
  // origin with getp-params, hash and omit
})
