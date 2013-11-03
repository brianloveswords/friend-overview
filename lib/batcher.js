module.exports = batcher

function batcher(arr, size) {
  return {
    arr: arr,
    size: size,
    start: 0,
    next: nextProto,
  }
}

function nextProto() {
  const start = this.start
  const end = start + this.size
  const chunk = this.arr.slice(start, end)
  this.start = end
  return chunk
}
