/**
 * Shorten a Pocket address, `charsLength` allows to change the number of
 * characters on both sides of the ellipsis.
 *
 * Examples:
 *   shortenAddress('D19731977931271')    // D1973…1271
 *   shortenAddress('A19731977931271', 2) // A1…71
 *   shortenAddress('F197319')            // F197319 (already short enough)
 *
 * @param {string} address The address to shorten
 * @param {number} [charsLength=4] The number of characters to change on both sides of the ellipsis
 * @returns {string} The shortened address
 */
export function shortenAddress(address, charsLength = 4) {
  const prefixLength = 2 // "0x"

  if (!address) {
    return ''
  }
  if (address.length < charsLength * 2 + prefixLength) {
    return address
  }
  return (
    address.slice(0, charsLength + prefixLength) +
    '…' +
    address.slice(-charsLength)
  )
}
