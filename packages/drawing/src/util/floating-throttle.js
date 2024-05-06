/**
 * @param {Function} function_
 * @param {number|Function} wait
 */
export default function floatingThrottle(function_, wait) {
  let isThrottled = false
  let lastArguments = null
  let lastThis = null

  const wrapper = (...args) => {
    if (isThrottled) {
      lastArguments = args
      // eslint-disable-next-line unicorn/no-this-assignment
      lastThis = this
    } else {
      function_.apply(this, args)

      isThrottled = true

      setTimeout(
        () => {
          isThrottled = false
          if (lastArguments) {
            wrapper.apply(lastThis, lastArguments)

            lastArguments = null
            lastThis = null
          }
        },
        typeof wait === 'number' ? wait : wait(),
      )
    }
  }

  return wrapper
}
