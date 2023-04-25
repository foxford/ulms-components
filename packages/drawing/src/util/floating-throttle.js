/**
 * @param {Function} func
 * @param {number|Function} wait
 */
export default function floatingThrottle (func, wait) {
  let isThrottled = false
  let lastArguments = null
  let lastThis = null

  const wrapper = (...args) => {
    if (isThrottled) {
      lastArguments = args
      lastThis = this
    } else {
      func.apply(this, args)

      isThrottled = true

      setTimeout(() => {
        isThrottled = false
        if (lastArguments) {
          wrapper.apply(lastThis, lastArguments)

          lastArguments = null
          lastThis = null
        }
      }, typeof wait === 'number' ? wait : wait())
    }
  }

  return wrapper
}
