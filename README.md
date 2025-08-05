# pantheon-secrets

A lightweight TypeScript utility package for Node.js applications to retrieve secrets from Pantheon-style environment variables. It simplifies the process of fetching environment-specific and production secrets with full type safety.

## Installation

You can install this package via npm:

```bash
npm install pantheon-secrets
```

## Features

- 🔐 **Secure secret management** - Environment-based secret resolution
- 📦 **Dual module support** - Works with both ESM (`import`) and CommonJS (`require`)
- 🎯 **TypeScript native** - Full type safety and IntelliSense support
- 🚀 **Zero dependencies** - Lightweight with no external dependencies
- ✅ **Well tested** - Comprehensive test suite included

## Usage

The package exposes a single function, `pantheonGetSecret`, which takes the name of a secret as a string and returns the corresponding value or `null` if not found.

### ESM (Modern JavaScript/TypeScript)

```typescript
import { pantheonGetSecret } from 'pantheon-secrets';

const mySecret = pantheonGetSecret('HELLO');
console.log(`The value of HELLO is: ${mySecret}`);

const anotherSecret = pantheonGetSecret('nonexistent');
console.log(`The value of nonexistent is: ${anotherSecret}`);
// The value of nonexistent is: null
```

### CommonJS (Traditional Node.js)

```javascript
const { pantheonGetSecret } = require('pantheon-secrets');

const mySecret = pantheonGetSecret('HELLO');
console.log(`The value of HELLO is: ${mySecret}`);
```

## How It Works

The function automatically determines which secret to use based on your application's environment variables. It first checks for a live production secret, then looks for a value specific to your current environment, and finally falls back to a default value if no other options are found. If the secret is not defined, it returns null.

## Development

### Building

```bash
npm run build          # Build all formats
npm run build:esm      # Build ESM only
npm run build:cjs      # Build CommonJS only
```

### Testing

```bash
npm install    # Install dependencies
npm test       # Run test suite
```

### Project Structure

- `index.ts` - Main TypeScript source
- `dist/esm/` - ESM build output (ESNext)
- `dist/cjs/` - CommonJS build output (ES2020)
- TypeScript definitions included for both formats
