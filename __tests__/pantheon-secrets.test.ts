// Import the function to be tested.
// Ensure the path is correct based on your project structure.
import { pantheonGetSecret } from '../src/pantheon-secrets.js';

// Define the mock environment variables used in the tests.
const mockSecretsDefault = {
  "HELLO": {
    "value": "world",
    "type": "env",
    "envValues": {
      "pr-1": "pr-1-value"
    }
  },
  "foo": {
    "value": "bar",
    "type": "runtime",
    "envValues": {
      "dev": "bardev-value"
    }
  },
  "NO_ENV_VALUE": {
    "value": "no-env-value-default",
  },
  "INVALID_SECRET": {
    "value": null,
  }
};

const mockSecretsProduction = {
  "HELLO": "valueLive"
};

// Use Jest's describe to group related tests.
describe('pantheonGetSecret', () => {
  // Use a beforeEach hook to clean up and set mock environment variables
  // before each test runs to ensure test isolation.
  beforeEach(() => {
    // Clear any existing environment variables that might interfere.
    delete process.env.APP_ENV;
    delete process.env.SITE_SECRETS_DEFAULT;
    delete process.env.SITE_SECRETS_PRODUCTION;
  });

  // Test case for the 'live' environment, with a secret in SITE_SECRETS_PRODUCTION.
  test('should return the production value when APP_ENV is "live"', () => {
    // Set the environment for this test.
    process.env.APP_ENV = 'live';
    process.env.SITE_SECRETS_PRODUCTION = JSON.stringify(mockSecretsProduction);
    process.env.SITE_SECRETS_DEFAULT = JSON.stringify(mockSecretsDefault);

    // Assert that the function returns the expected value.
    expect(pantheonGetSecret('HELLO')).toBe('valueLive');
  });

  // Test case for the 'live' environment, but the secret is not in production.
  test('should fallback to default when APP_ENV is "live" but secret is not in production', () => {
    // Set the environment for this test.
    process.env.APP_ENV = 'live';
    process.env.SITE_SECRETS_PRODUCTION = JSON.stringify(mockSecretsProduction);
    process.env.SITE_SECRETS_DEFAULT = JSON.stringify(mockSecretsDefault);

    // The 'foo' secret is not in mockSecretsProduction, so it should fall back to the default.
    expect(pantheonGetSecret('foo')).toBe('bar');
  });

  // Test case for a non-'live' environment with a specific envValues match.
  test('should return env-specific value for a non-live environment with a match', () => {
    // Set the environment for this test.
    process.env.APP_ENV = 'pr-1';
    process.env.SITE_SECRETS_DEFAULT = JSON.stringify(mockSecretsDefault);

    // Assert that the function returns the value for 'pr-1'.
    expect(pantheonGetSecret('HELLO')).toBe('pr-1-value');
  });

  // Test case for a non-'live' environment with no specific envValues match.
  test('should return default value for a non-live environment with no match', () => {
    // Set the environment for this test.
    process.env.APP_ENV = 'stg'; // No 'stg' key in envValues.
    process.env.SITE_SECRETS_DEFAULT = JSON.stringify(mockSecretsDefault);

    // Assert that the function falls back to the default 'value'.
    expect(pantheonGetSecret('HELLO')).toBe('world');
  });

  // Test case where the secret is defined but has no envValues or value.
  test('should return null for a malformed secret definition', () => {
    // Set the environment for this test.
    process.env.APP_ENV = 'dev';
    process.env.SITE_SECRETS_DEFAULT = JSON.stringify(mockSecretsDefault);

    // The 'INVALID_SECRET' has no value, so it should return null.
    expect(pantheonGetSecret('INVALID_SECRET')).toBe(null);
  });

  // Test case where the secret does not exist.
  test('should return null for a nonexistent secret', () => {
    // Set the environment for this test.
    process.env.APP_ENV = 'pr-1';
    process.env.SITE_SECRETS_DEFAULT = JSON.stringify(mockSecretsDefault);

    // A non-existent secret name should return null.
    expect(pantheonGetSecret('NON_EXISTENT_SECRET')).toBe(null);
  });

  // Test case for invalid JSON in environment variables.
  test('should return null when SITE_SECRETS_DEFAULT JSON is invalid', () => {
    // Set the environment with invalid JSON.
    process.env.APP_ENV = 'pr-1';
    process.env.SITE_SECRETS_DEFAULT = '{"HELLO": "world"'; // Malformed JSON

    // A parsing error should result in a null return value.
    expect(pantheonGetSecret('HELLO')).toBe(null);
  });
});