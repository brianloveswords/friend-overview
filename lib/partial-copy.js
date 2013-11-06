module.exports = function partialCopy(fields, obj) {
  if (!obj)
    return partialCopy.bind(null, fields)
  return fields.reduce(function (copy, field) {
    copy[field] = obj[field]
    return copy
  }, {})
}
