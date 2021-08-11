export const toCSSColor = (rgbaColor) => {
  const {
    r, g, b, a,
  } = rgbaColor

  return `rgba(${r},${g},${b},${a})`
}

export const fromCSSColor = (str) => {
  const substr = str.match(/^rgba\((.*)\)/)[1]
  const [r, g, b, a] = substr.split(',')
  return {
    r: parseInt(r, 10),
    g: parseInt(g, 10),
    b: parseInt(b, 10),
    a: parseFloat(a).toFixed(5)
  }
}
