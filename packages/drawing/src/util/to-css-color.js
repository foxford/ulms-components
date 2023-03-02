export const toCSSColor = (rgbaColor) => {
  const {
    r, g, b, a = 1,
  } = rgbaColor

  return `rgba(${r},${g},${b},${a})`
}

export const fromCSSColor = (str) => {
  const substr = str.match(/^rgba\((.*)\)/)[1]
  const [
    r,
    g,
    b,
    a,
  ] = substr.split(',')

  return {
    r: parseInt(r, 10),
    g: parseInt(g, 10),
    b: parseInt(b, 10),
    a: parseFloat(a).toFixed(5),
  }
}

export function HEXtoRGB (str) {
  const regex = new RegExp('#([\\da-fA-F]{2})([\\da-fA-F]{2})([\\da-fA-F]{2})')
  const [
    // eslint-disable-next-line no-unused-vars
    dummy,
    rHex,
    gHex,
    bHex,
  ] = regex.exec(str)

  return {
    r: parseInt(rHex, 16),
    g: parseInt(gHex, 16),
    b: parseInt(bHex, 16),
  }
}
