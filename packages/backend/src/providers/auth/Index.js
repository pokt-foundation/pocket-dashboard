import BaseAuthProvider from "./BaseAuthProvider";

/**
 * @param {BaseAuthProvider[]} authProviders List of available Auth Providers.
 * @param {string} name Name of Authentication provider.
 *
 * @returns {BaseAuthProvider} An auth provider.
 */
export function getAuthProvider(authProviders, name) {
  return authProviders.filter(
    (provider) => provider.name === name.toLowerCase()
  )[0];
}
