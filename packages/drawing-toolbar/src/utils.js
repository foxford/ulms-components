export function toCSSColor (rgbaColor) {
  console.log({ rgbaColor })
  const {
    r, g, b, a,
  } = rgbaColor

  return `rgba(${r},${g},${b},${a})`
}
