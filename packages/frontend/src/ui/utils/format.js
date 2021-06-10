/**
 * Formats an integer based on a limited range.
 *
 * Example:
 *   formatIntegerRange(234, 0, 99, '+') === "99+"
 *
 * @param {number} value     The number to format.
 * @param {number} min       Range minimum.
 * @param {number} max       Range maximum.
 * @param {number} maxSuffix Suffix to add if the value exceeds the max.
 */
export function formatIntegerRange(
  value = -1,
  min = 0,
  max = 99,
  maxSuffix = ''
) {
  value = parseInt(value, 10)
  if (value <= min) {
    return `${parseInt(min, 10)}`
  }
  if (value > max) {
    return `${parseInt(max, 10)}${maxSuffix}`
  }
  return String(value)
}

/**
 * Formats a number for display purposes.
 *
 * This function is not using Intl.NumberFormat() to be compatible with big
 * integers expressed as string, or BigInt-like objects.
 *
 * @param {BigInt|string|number} number Number to convert
 * @returns {string}
 */
export function formatNumber(number) {
  const numAsString = String(number)
  const [integer, decimals] = numAsString.split('.')

  return [...integer].reverse().reduce(
    (result, digit, index) => {
      return digit + (index > 0 && index % 3 === 0 ? ',' : '') + result
    },
    decimals ? `.${decimals}` : ''
  )
}
