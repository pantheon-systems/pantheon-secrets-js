# pantheon-secrets

A lightweight utility package for Node.js applications to retrieve secrets from Pantheon-style environment variables. It simplifies the process of fetching environment-specific and production secrets.

## Installation

You can install this package via npm.

```bash
npm install pantheon-secrets
```

## Usage

The package exposes a single function, `pantheonGetSecret`, which takes the name of a secret as a string and returns the corresponding value.

### Example

First, import the function into your application:

```javascript
import { pantheonGetSecret } from 'pantheon-secrets';
```

Then, you can use it to retrieve secrets:

```javascript
const mySecret = pantheonGetSecret('HELLO');
console.log(`The value of HELLO is: ${mySecret}`);

const anotherSecret = pantheonGetSecret('nonexistent');
console.log(`The value of nonexistent is: ${anotherSecret}`);
// The value of nonexistent is: null
```

## How It Works

The function automatically determines which secret to use based on your application's environment variables. It first checks for a live production secret, then looks for a value specific to your current environment, and finally falls back to a default value if no other options are found. If the secret is not defined, it returns `null`.

## Running Tests

To run the provided test suite, simply run the following commands:

1.  **Install Dependencies:**
    `npm install`
2.  **Run Tests:**
    `npm test`

These commands will install the necessary `jest` package and then execute your tests.
