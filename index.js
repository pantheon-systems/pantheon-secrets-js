/**
 * @fileoverview A small utility package to retrieve secrets from Pantheon-style
 * environment variables based on the current application environment.
 * @author Gemini
 */

/**
 * Retrieves a secret value based on a given secret name and the current application environment.
 *
 * The function follows this logic:
 * 1.  Check for a `SITE_SECRETS_PRODUCTION` environment variable. If `APP_ENV` is 'live'
 * and the secret exists in `SITE_SECRETS_PRODUCTION`, its value is returned.
 * 2.  Otherwise, it checks the `SITE_SECRETS_DEFAULT` environment variable.
 * a.  If the secret has an `envValues` object and the current `APP_ENV` matches a key
 * in that object, the corresponding value is returned.
 * b.  If no specific `envValues` match, the default `value` from the secret definition is returned.
 *
 * @param {string} secretName The name of the secret to retrieve.
 * @returns {string|null} The secret value as a string, or `null` if the secret is not found.
 */
export function pantheonGetSecret(secretName) {
  // Get the current application environment from an environment variable.
  const appEnv = process.env.APP_ENV;

  // Retrieve the raw JSON strings from environment variables.
  const secretsDefaultRaw = process.env.SITE_SECRETS_DEFAULT;
  const secretsProductionRaw = process.env.SITE_SECRETS_PRODUCTION;

  let secretsDefault = {};
  let secretsProduction = {};

  // Parse the JSON strings, handling potential errors.
  try {
    if (secretsDefaultRaw) {
      secretsDefault = JSON.parse(secretsDefaultRaw);
    }
    if (secretsProductionRaw) {
      secretsProduction = JSON.parse(secretsProductionRaw);
    }
  } catch (error) {
    console.error('Failed to parse SITE_SECRETS JSON:', error);
    return null;
  }

  // Logic for a 'live' environment.
  if (appEnv === 'live') {
    // Check if the secret exists in the production secrets.
    if (secretsProduction[secretName] !== undefined) {
      console.log(`[pantheon-secrets] Found '${secretName}' in production secrets. Returning live value.`);
      return secretsProduction[secretName];
    }
  }

  // Fallback to default secrets.
  const secretDefinition = secretsDefault[secretName];
  if (secretDefinition) {
    // Check for an environment-specific value within the default secrets.
    if (secretDefinition.envValues && secretDefinition.envValues[appEnv] !== undefined) {
      console.log(`[pantheon-secrets] Found '${secretName}' with env-specific value for '${appEnv}'.`);
      return secretDefinition.envValues[appEnv];
    }

    // If no environment-specific value is found, return the default value.
    if (secretDefinition.value !== undefined) {
      console.log(`[pantheon-secrets] Found '${secretName}' but no env-specific value. Returning default value.`);
      return secretDefinition.value;
    }
  }

  // If the secret is not found in either location, return null.
  console.warn(`[pantheon-secrets] Secret '${secretName}' not found. Returning null.`);
  return null;
}