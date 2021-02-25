export const toCSSColor = (rgbaColor) => {
  const {
    r, g, b, a,
  } = rgbaColor

  return `rgba(${r},${g},${b},${a})`
}
