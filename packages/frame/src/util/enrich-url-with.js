// eslint-disable-next-line import/prefer-default-export
export const enrichUrlWith = (
  url,
  // eslint-disable-next-line default-param-last
  parameters = {},
  type,
  origin,
  omitOriginParameters,
) => {
  if (Object.keys(parameters).length === 0) {
    return origin ? url.replace(type, origin) : url
  }

  const append = []

  for (const a of Object.keys(parameters)) {
    append.push(`${a}=${parameters[a]}`)
  }

  const hasParameters = origin ? origin.split('?').length === 2 : false
  const hasHash = origin ? origin.split('#').length === 2 : false

  let nextUrl

  if (origin) {
    const [originUrl, originParameters = ''] = origin.split('?')

    let _url = url

    if (omitOriginParameters) {
      // for dev reason when target frame url do n
      const [_urlUrl] = url.split('/')

      _url = _urlUrl
    }

    nextUrl = `${_url.replace(type, originUrl)}${
      originParameters ? `?${originParameters}` : ''
    }`
  } else {
    nextUrl = url
  }

  if (hasParameters) {
    const [previousUrl, previousParameters = '', previousHash = ''] =
      nextUrl.split(/[#?]/)

    nextUrl = `${previousUrl}?${previousParameters}&${append.join('&')}${
      previousHash ? `#${previousHash}` : ''
    }`
  } else if (hasHash) {
    const [previousUrl, previousHash = ''] = nextUrl.split('#')

    nextUrl = `${previousUrl}?${append.join('&')}${
      previousHash ? `#${previousHash}` : '#'
    }`
  } else {
    nextUrl = `${nextUrl}?${append.join('&')}`
  }

  return nextUrl
}
