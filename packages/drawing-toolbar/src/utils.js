export function toCSSColor (rgbaColor) {
  const {
    r, g, b, a,
  } = rgbaColor

  return `rgba(${r},${g},${b},${a})`
}

export const fromCSSColor = (str) => {
  if (str.startsWith('rgba(')) {
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
  } if (str.startsWith('rgb(')) {
    const substr = str.match(/^rgb\((.*)\)/)[1]
    const [r, g, b] = substr.split(',')

    return {
      r: parseInt(r, 10),
      g: parseInt(g, 10),
      b: parseInt(b, 10),
      a: 1,
    }
  }

  return {}
}

const toTwoDigitsHex = number => (`0${number.toString(16)}`).slice(-2)

export function RGBtoWEB ({
  r, g, b,
}) {
  return `#${toTwoDigitsHex(r)}${toTwoDigitsHex(g)}${toTwoDigitsHex(b)}`
}

export function WEBtoRGB (str) {
  const regex = new RegExp('#([\\da-fA-F]{2})([\\da-fA-F]{2})([\\da-fA-F]{2})')
  const [
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
