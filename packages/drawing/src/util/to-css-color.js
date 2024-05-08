export const toCSSColor = (rgbaColor) => {
  const { r, g, b, a = 1 } = rgbaColor

  return `rgba(${r},${g},${b},${a})`
}

export const fromCSSColor = (string_) => {
  const substr = string_.match(/^rgba\((.*)\)/)[1]
  const [r, g, b, a] = substr.split(',')

  return {
    r: Number.parseInt(r, 10),
    g: Number.parseInt(g, 10),
    b: Number.parseInt(b, 10),
    a: Number.parseFloat(a).toFixed(5),
  }
}

export function HEXtoRGB(string_) {
  const regex = /#([\dA-Fa-f]{2})([\dA-Fa-f]{2})([\dA-Fa-f]{2})/
  const [
    // eslint-disable-next-line no-unused-vars
    dummy,
    rHex,
    gHex,
    bHex,
  ] = regex.exec(string_)

  return {
    r: Number.parseInt(rHex, 16),
    g: Number.parseInt(gHex, 16),
    b: Number.parseInt(bHex, 16),
  }
}
