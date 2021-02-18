export const enrichUrlWith = (url, params = {}, type, origin, omitOriginParams) => {
  if (!Object.keys(params).length) {
    return origin ? url.replace(type, origin) : url
  }

  const append = []

  Object.keys(params).forEach((a) => {
    append.push(`${a}=${params[a]}`)
  })

  const hasParams = origin ? origin.split('?').length === 2 : false
  const hasHash = origin ? origin.split('#').length === 2 : false

  let nextUrl

  if (origin) {
    const [originUrl, originParams = ''] = origin.split('?')

    let _url = url

    if (omitOriginParams) {
      // for dev reason when target frame url do n
      const [_urlUrl] = url.split('/')

      _url = _urlUrl
    }

    nextUrl = `${_url.replace(type, originUrl)}${originParams ? `?${originParams}` : ''}`
  } else {
    nextUrl = url
  }

  if (hasParams) {
    const [prevUrl, prevParams = '', prevHash = ''] = nextUrl.split(/[?#]/)

    nextUrl = `${prevUrl}?${prevParams}&${append.join('&')}${prevHash ? `#${prevHash}` : ''}`
  } else if (hasHash) {
    const [prevUrl, prevHash = ''] = nextUrl.split('#')

    nextUrl = `${prevUrl}?${append.join('&')}${prevHash ? `#${prevHash}` : '#'}`
  } else {
    nextUrl = `${nextUrl}?${append.join('&')}`
  }

  return nextUrl
}
