# 🔐 G-SSO SDK

Universal multi-chain wallet authentication SDK for decentralized Single Sign-On.

[![NPM Version](https://img.shields.io/npm/v/@gsso/sdk)](https://www.npmjs.com/package/@gsso/sdk)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@gsso/sdk)](https://bundlephobia.com/package/@gsso/sdk)

---

## ✨ Features

✅ **17+ Wallet Support** - MetaMask, Phantom, Coinbase, Trust, Rainbow, and more  
✅ **5 Blockchain Networks** - Ethereum, Solana, Bitcoin, Polkadot, Cardano  
✅ **Desktop + Mobile** - QR code authentication for mobile wallets  
✅ **Real-time Updates** - WebSocket + polling for instant authentication  
✅ **Multi-Domain SSO** - One login works across all integrated sites  
✅ **Zero Gas Fees** - Uses signatures, not transactions  
✅ **Universal** - Works in vanilla JS, React, Vue, WordPress, and more  
✅ **TypeScript** - Fully typed for better DX  
✅ **Tree-shakeable** - Only import what you need  

---

## 📦 Installation

### NPM / Yarn

```bash
# NPM
npm install @gsso/sdk

# Yarn
yarn add @gsso/sdk

# PNPM
pnpm add @gsso/sdk
```

### CDN (Browser)

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/@gsso/sdk/dist/gsso.umd.js"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/@gsso/sdk@1.0.0/dist/gsso.umd.js"></script>

<!-- After loading, GSSO is available globally -->
<script>
  const sdk = GSSO.init({ apiUrl: 'https://g-sso.com' });
</script>
```

---

## 🚀 Quick Start

### 1. Vanilla JavaScript / TypeScript

```javascript
import { GSSO } from '@gsso/sdk';

// Initialize SDK
const sdk = GSSO.init({
  apiUrl: 'https://g-sso.com',
  autoConnect: true
});

// Listen for authentication
sdk.on('authenticated', (user) => {
  console.log('User logged in:', user);
  console.log('Address:', user.address);
  console.log('Chain:', user.chainType);
});

// Check if authenticated
if (sdk.isAuthenticated()) {
  const user = sdk.getUser();
  console.log('Already authenticated:', user);
}

// Logout
await sdk.logout();
```

### 2. React

```tsx
import { GSSORProvider, useGSSO } from '@gsso/sdk/react';

// Wrap your app with provider
function App() {
  return (
    <GSSORProvider config={{ apiUrl: 'https://g-sso.com' }}>
      <YourApp />
    </GSSORProvider>
  );
}

// Use in components
function LoginButton() {
  const { user, isAuthenticated, isLoading, logout } = useGSSO();

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user.address}</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <ConnectWallet apiUrl="https://g-sso.com" />;
}
```

### 3. Vue 3

```vue
<script setup>
import { initGSSO, useGSSO } from '@gsso/sdk/vue';

// Initialize once in main.ts or App.vue
initGSSO({ apiUrl: 'https://g-sso.com' });

// Use in components
const { user, isAuthenticated, isLoading, logout } = useGSSO();
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isAuthenticated">
    <p>Welcome, {{ user.address }}</p>
    <button @click="logout">Logout</button>
  </div>
  <div v-else>
    <!-- Your connect wallet UI -->
  </div>
</template>
```

### 4. WordPress / PHP

```php
<?php
// Enqueue SDK
wp_enqueue_script(
  'gsso-sdk',
  'https://cdn.jsdelivr.net/npm/@gsso/sdk/dist/gsso.umd.js',
  array(),
  '1.0.0',
  true
);
?>

<!-- In your theme/plugin -->
<div id="wallet-connect"></div>

<script>
// Initialize SDK
const sdk = GSSO.init({
  apiUrl: 'https://g-sso.com'
});

// Handle authentication
sdk.on('authenticated', (user) => {
  // Send to WordPress backend
  fetch('/wp-admin/admin-ajax.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      action: 'gsso_save_user',
      address: user.address,
      chain: user.chainType,
      token: sdk.getToken()
    })
  });
});
</script>
```

---

## 📚 API Reference

### SDK Initialization

```typescript
import { GSSO } from '@gsso/sdk';

const sdk = GSSO.init({
  // Required
  apiUrl: 'https://g-sso.com',

  // Optional
  clientId: 'your-client-id',
  clientSecret: 'your-secret',
  autoConnect: true,
  sessionStorage: 'localStorage', // 'localStorage' | 'sessionStorage' | 'cookie'
  tokenRefreshInterval: 3600000, // 1 hour in ms
  chains: ['ethereum', 'solana'], // Limit supported chains
  
  // Callbacks
  onAuthenticated: (user) => console.log('Logged in:', user),
  onLogout: () => console.log('Logged out'),
  onError: (error) => console.error('Error:', error),
  
  // Analytics
  analytics: true,
  onEvent: (event, data) => console.log(event, data)
});
```

### Authentication Methods

```typescript
// Get current session
const session = await sdk.getSession();

// Check if authenticated
const isAuth = sdk.isAuthenticated();

// Get user info
const user = sdk.getUser();

// Get token
const token = sdk.getToken();

// Validate token
const isValid = await sdk.validateToken(token);

// Refresh token
await sdk.refreshToken();

// Logout (current device)
await sdk.logout();

// Logout (all devices)
await sdk.logoutAll();
```

### Event Listeners

```typescript
// Authentication events
sdk.on('authenticated', (user) => {
  console.log('User:', user);
});

sdk.on('logout', () => {
  console.log('User logged out');
});

sdk.on('error', (error) => {
  console.error('Error:', error);
});

// Token events
sdk.on('token:refreshed', ({ token }) => {
  console.log('New token:', token);
});

// Wallet events
sdk.on('wallet:connected', (address) => {
  console.log('Wallet connected:', address);
});

// Remove listener
sdk.off('authenticated', handler);
```

---

## 🎨 UI Components

### ConnectWallet (React)

```tsx
import { ConnectWallet } from '@gsso/sdk/react';

function App() {
  return (
    <ConnectWallet
      apiUrl="https://g-sso.com"
      buttonText="Sign in with Wallet"
      buttonClassName="custom-button"
      onConnect={(result) => {
        console.log('Connected:', result.address);
        console.log('Token:', result.token);
      }}
      onError={(error) => {
        console.error('Connection failed:', error);
      }}
    />
  );
}
```

### Custom Button

```tsx
import { ConnectWallet } from '@gsso/sdk/react';

function App() {
  return (
    <ConnectWallet apiUrl="https://g-sso.com">
      <button className="my-custom-button">
        🔐 Connect Your Wallet
      </button>
    </ConnectWallet>
  );
}
```

### Mobile Authentication Page

```tsx
// pages/mobile-auth.tsx (Next.js)
import { MobileAuth } from '@gsso/sdk/react';

export default function MobileAuthPage() {
  return (
    <MobileAuth
      apiUrl="https://g-sso.com"
      logoUrl="/logo.png"
      onSuccess={(address, chainType) => {
        console.log('Mobile auth success:', address);
      }}
      onError={(error) => {
        console.error('Mobile auth failed:', error);
      }}
    />
  );
}
```

---

## 🔧 Backend Integration

### Node.js / Express

```javascript
const express = require('express');
const axios = require('axios');

const app = express();

// Protected route
app.get('/api/protected', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Validate token with G-SSO backend
    const response = await axios.post('https://g-sso.com/auth/validate-token', {
      token
    });

    if (response.data.valid) {
      const user = response.data.user;
      res.json({
        message: 'Access granted',
        user: {
          address: user.address,
          chain: user.chainType
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Token validation failed' });
  }
});

app.listen(3000);
```

### Next.js API Routes

```typescript
// pages/api/protected.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  const response = await fetch('https://g-sso.com/auth/validate-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  const data = await response.json();

  if (data.valid) {
    return res.status(200).json({ user: data.user });
  }

  return res.status(401).json({ error: 'Invalid token' });
}
```

---

## 🌐 Supported Wallets

### Ethereum (5)
- 🦊 **MetaMask** - Most popular
- 💙 **Coinbase Wallet** - Secure & trusted
- 🌈 **Rainbow** - Beautiful & simple
- 🛡️ **Trust Wallet** - Multi-chain
- 🐰 **Rabby** - DeFi focused

### Solana (2)
- 👻 **Phantom** - Leading Solana wallet
- 🔥 **Solflare** - Powerful features

### Bitcoin (1)
- 🟠 **UniSat** - Bitcoin & Ordinals

### Polkadot (1)
- 🔷 **SubWallet** - Comprehensive

### Cardano (1)
- ♾️ **Eternl** - Feature-rich

---

## 📖 Examples

### Complete React App

```tsx
import React from 'react';
import { GSSORProvider, useGSSO, ConnectWallet } from '@gsso/sdk/react';

function App() {
  return (
    <GSSORProvider 
      config={{ 
        apiUrl: 'https://g-sso.com',
        chains: ['ethereum', 'solana']
      }}
    >
      <Dashboard />
    </GSSORProvider>
  );
}

function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useGSSO();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Welcome to My DApp</h1>
        <ConnectWallet 
          apiUrl="https://g-sso.com"
          onConnect={(result) => {
            console.log('Connected:', result);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <p>Address: {user.address}</p>
        <p>Chain: {user.chainType}</p>
      </div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default App;
```

---

## 🔐 Security Best Practices

1. **Always validate tokens server-side** - Never trust client-only validation
2. **Use HTTPS** - Always use secure connections in production
3. **Refresh tokens regularly** - Enable auto token refresh
4. **Handle token expiration** - Implement proper error handling
5. **Store tokens securely** - Use `sessionStorage` for sensitive apps
6. **Rate limit API calls** - Implement rate limiting on your backend

---

## 🌍 Browser Support

- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Opera**: 76+
- **Mobile browsers**: iOS Safari 14+, Android Chrome 90+

---

## 📄 License

MIT © G-SSO Team

---

## 🤝 Support

- 📧 Email: support@g-sso.com
- 📖 Documentation: https://g-sso.com/docs
- 💬 Discord: https://discord.gg/gsso
- 🐛 Issues: https://github.com/go2gloryltd/g-sso/issues

---

## 🚀 Roadmap

- [ ] Hardware wallet support (Ledger, Trezor)
- [ ] Additional chains (Cosmos, Near, Aptos)
- [ ] Social login integration
- [ ] Biometric authentication
- [ ] Multi-signature support
- [ ] Session management dashboard

---

Made with ❤️ by the G-SSO Team