module.exports = rateLimiter

function rateLimiter(fn, opts) {
  const window = opts.window
  const limit = opts.limit

  const msBetweenCalls = (window / limit) * 1000
  var lastCall;

  if (isNaN(msBetweenCalls))
    throw new Error('opts.window and opts.limit must both be numbers')

  return function limitedFn() {
    const args = arguments
    if (!lastCall) {
      lastCall = Date.now()
      return fn.apply(null, args)
    }
    const sinceLastCall = Date.now() - lastCall
    const timeRemaining = msBetweenCalls - sinceLastCall

    if (sinceLastCall < msBetweenCalls) {
      lastCall = lastCall + msBetweenCalls
      return setTimeout(function () {
        return fn.apply(null, args)
      }, timeRemaining)
    }
  }
}
