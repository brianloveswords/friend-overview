const test = require('./')
const partialCopy = require('../lib/partial-copy')

test('partialCopy', function (t) {
  const obj = { one: 1, two: 2, three: 3, four: 4 }
  const expect = { one: 1, two: 2, three: 3 }
  t.same(partialCopy(['one', 'two', 'three'], obj), expect)
  t.same(partialCopy(['one', 'two', 'three'])(obj), expect)
  t.end()
})
