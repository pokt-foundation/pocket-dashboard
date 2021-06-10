/**
 * Normalizes a number from another range into a value between 0 and 1.
 *
 * Identical to map(value, low, high, 0, 1)
 * Numbers outside the range are not clamped to 0 and 1, because out-of-range
 * values are often intentional and useful.
 *
 * From Processing.js
 *
 * @param {Number} aNumber The incoming value to be converted
 * @param {Number} low Lower bound of the value's current range
 * @param {Number} high Upper bound of the value's current range
 * @returns {Number} Normalized number
 */
export function norm(aNumber, low, high) {
  return (aNumber - low) / (high - low)
}
