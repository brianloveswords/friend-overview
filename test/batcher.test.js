const test = require('./')
const batcher = require('../lib/batcher.js')

test('batcher', function (t) {
  const chunks = batcher([1,2,3,4,5,6,7], 2)

  t.same(chunks.next(), [1,2])
  t.same(chunks.next(), [3,4])
  t.same(chunks.next(), [5,6])
  t.same(chunks.next(), [7])
  t.same(chunks.next(), [])
  t.same(chunks.next(), [])
  t.same(chunks.next(), [])
  t.end()
})
