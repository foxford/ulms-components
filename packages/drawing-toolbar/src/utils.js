export function toCSSColor(rgbaColor) {
  const { r, g, b, a } = rgbaColor

  return `rgba(${r},${g},${b},${a})`
}

export const fromCSSColor = (string_) => {
  if (string_.startsWith('rgba(')) {
    const substr = string_.match(/^rgba\((.*)\)/)[1]
    const [r, g, b, a] = substr.split(',')

    return {
      r: Number.parseInt(r, 10),
      g: Number.parseInt(g, 10),
      b: Number.parseInt(b, 10),
      a: Number.parseFloat(Number.parseFloat(a).toFixed(5)),
    }
  }
  if (string_.startsWith('rgb(')) {
    const substr = string_.match(/^rgb\((.*)\)/)[1]
    const [r, g, b] = substr.split(',')

    return {
      r: Number.parseInt(r, 10),
      g: Number.parseInt(g, 10),
      b: Number.parseInt(b, 10),
      a: 1,
    }
  }

  return {}
}

const toTwoDigitsHex = (number) => `0${number.toString(16)}`.slice(-2)

export function RGBtoHEX({ r, g, b }) {
  return `#${toTwoDigitsHex(r)}${toTwoDigitsHex(g)}${toTwoDigitsHex(b)}`
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
