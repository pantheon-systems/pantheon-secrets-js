# pantheon-secrets

A lightweight utility package for Node.js applications to retrieve secrets from Pantheon-style environment variables. It simplifies the process of fetching environment-specific values and production secrets.

## Installation

You can install this package via npm.

```
npm install pantheon-secrets
```

## Usage

The package exposes a single function, `pantheonGetSecret`, which takes the name of a secret as a string and returns the corresponding value.

### Example

First, import the function into your application:

```
import { pantheonGetSecret } from 'pantheon-secrets';
```

Then, you can use it to retrieve secrets:

```
const mySecret = pantheonGetSecret('HELLO');
console.log(`The value of HELLO is: ${mySecret}`);

const anotherSecret = pantheonGetSecret('nonexistent');
console.log(`The value of nonexistent is: ${anotherSecret}`);
// The value of nonexistent is: null
```

## How It Works

The `pantheonGetSecret` function follows a specific hierarchy for retrieving values:

1.  **Production Secrets:** If the `APP_ENV` environment variable is set to `'live'` and a secret with the given name exists in `SITE_SECRETS_PRODUCTION`, that value is returned immediately.

2.  **Environment-Specific Values:** If the above condition is not met, the function checks the `SITE_SECRETS_DEFAULT` variable. If the secret has an `envValues` property and the current `APP_ENV` matches a key in that object, the corresponding value is returned.

3.  **Default Value:** If no environment-specific match is found, the function returns the default `value` from the secret's definition in `SITE_SECRETS_DEFAULT`.

4.  **Not Found:** If the secret is not found in any of the above locations, the function returns `null`.

### Environment Variables

This package relies on the following environment variables:

* `APP_ENV`: A string that defines the current environment (e.g., `'live'`, `'dev'`, `'pr-1'`).

* `SITE_SECRETS_DEFAULT`: A JSON-formatted string containing the default secret definitions.

* `SITE_SECRETS_PRODUCTION`: An optional JSON-formatted string containing the secrets for the live environment.

#### Example `SITE_SECRETS_DEFAULT`

```
{
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
  }
}
```

#### Example `SITE_SECRETS_PRODUCTION`

```
{
  "HELLO": "valueLive"
}
```

## Running Tests

To run the provided test suite, you need to have `jest` installed as a dev dependency.

1.  **Install Jest:** `npm install --save-dev jest`

2.  **Add Test Script:** Ensure your `package.json` includes the following script:

    ```
    "scripts": {
      "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
    }
    ```

3.  **Run Tests:** `npm test`
