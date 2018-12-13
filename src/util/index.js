import debug from 'debug'

export const Debug = (ns) => {
  if (process.env.NODE_ENV === 'production') return () => undefined

  return debug(ns)
}
