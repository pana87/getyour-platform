module.exports = class Type {
  static of(thing) {
    if (!thing) return undefined
    return thing.constructor.name
  }
}
