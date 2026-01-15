# G2GDAO SDK

Multi-chain wallet authentication SDK for decentralized Single Sign-On (SSO).

## Features

✅ **17+ Wallet Support** - MetaMask, Phantom, Coinbase, Trust, Rainbow, and more  
✅ **5 Blockchain Networks** - Ethereum, Solana, Bitcoin, Polkadot, Cardano  
✅ **Desktop + Mobile** - QR code authentication for mobile wallets  
✅ **Real-time Updates** - WebSocket + polling for instant authentication  
✅ **Multi-Domain SSO** - One login works across all integrated sites  
✅ **Zero Gas Fees** - Uses signatures, not transactions  
✅ **TypeScript** - Fully typed for better DX  

---

## Installation

### NPM
```bash
npm install @g2gdao/sdk
# or
yarn add @g2gdao/sdk
```

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/@g2gdao/sdk@latest/dist/g2gdao.min.js"></script>
```

---

## Quick Start

### Vanilla JavaScript (CDN)
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/@g2gdao/sdk@latest/dist/g2gdao.min.js"></script>
</head>
<body>
  <button id="login-btn">Sign in with Wallet</button>
  <div id="user-info" style="display:none;">
    <p>Welcome, <span id="wallet-address"></span></p>
    <button id="logout-btn">Logout</button>
  </div>

  <script>
    // Initialize SDK
    const g2g = new G2GDAO({
      apiUrl: 'https://g-sso.com',
      autoConnect: true
    });

    // Login
    document.getElementById('login-btn').onclick = () => {
      g2g.login();
    };

    // Logout
    document.getElementById('logout-btn').onclick = () => {
      g2g.logout();
    };

    // Handle authentication
    g2g.on('authenticated', (user) => {
      console.log('User logged in:', user);
      document.getElementById('login-btn').style.display = 'none';
      document.getElementById('user-info').style.display = 'block';
      document.getElementById('wallet-address').textContent = 
        user.address.substring(0, 6) + '...' + user.address.substring(38);
    });

    // Handle logout
    g2g.on('logout', () => {
      document.getElementById('login-btn').style.display = 'block';
      document.getElementById('user-info').style.display = 'none';
    });

    // Handle errors
    g2g.on('error', (error) => {
      console.error('Auth error:', error);
      alert('Authentication failed: ' + error.message);
    });
  </script>
</body>
</html>
```

---

### React
```tsx
import { G2GDAOProvider, useG2GDAO } from '@g2gdao/sdk/react';

// Wrap your app with provider
function App() {
  return (
    <G2GDAOProvider config={{ apiUrl: 'https://g-sso.com' }}>
      <LoginPage />
    </G2GDAOProvider>
  );
}

// Use in components
function LoginPage() {
  const { login, logout, user, isAuthenticated, isLoading } = useG2GDAO();

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return (
      <div>
        <h2>Welcome!</h2>
        <p>Address: {user.address}</p>
        <p>Chain: {user.chainType}</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <button onClick={login}>Sign in with Wallet</button>;
}
```

---

## Configuration
```typescript
const g2g = new G2GDAO({
  // Required
  apiUrl: 'https://g-sso.com',

  // Optional
  clientId: 'your-client-id',
  theme: 'dark', // 'dark' | 'light' | 'auto'
  autoConnect: true,
  sessionStorage: 'localStorage', // 'localStorage' | 'sessionStorage' | 'cookie'
  tokenRefreshInterval: 3600000, // 1 hour in ms
  chains: ['ethereum', 'solana'], // Limit chains
  
  // Callbacks
  onAuthenticated: (user) => console.log(user),
  onLogout: () => console.log('Logged out'),
  onError: (error) => console.error(error),

  // QR Settings
  enableQR: true,
  qrSize: 256,
  qrTimeout: 300,

  // Analytics
  analytics: true,
  onEvent: (event, data) => console.log(event, data)
});
```

---

## API Reference

### Authentication
```typescript
// Open login modal
await g2g.login();

// Login with specific wallet
await g2g.login({ wallet: 'metamask' });

// Login with specific chain
await g2g.login({ chain: 'solana' });

// Logout current session
await g2g.logout();

// Logout from all devices
await g2g.logoutAll();
```

### Session Management
```typescript
// Get current session
const session = await g2g.getSession();

// Check if authenticated
const isAuth = g2g.isAuthenticated();

// Get user info
const user = g2g.getUser();

// Get token
const token = g2g.getToken();

// Validate token
const isValid = await g2g.validateToken(token);

// Refresh token
await g2g.refreshToken();
```

### Data Retrieval
```typescript
// Get recent activity
const activities = await g2g.getRecentActivity(20);

// Get blockchain proof
const proof = await g2g.getBlockchainProof();
```

### Events
```typescript
// Authentication events
g2g.on('authenticated', (user) => {});
g2g.on('logout', () => {});
g2g.on('error', (error) => {});

// Modal events
g2g.on('modal:opened', () => {});
g2g.on('modal:closed', () => {});

// Wallet events
g2g.on('wallet:connected', (address) => {});
g2g.on('wallet:disconnected', () => {});

// Token events
g2g.on('token:refreshed', ({ token }) => {});

// Remove listener
g2g.off('authenticated', handler);
```

### Modal Control
```typescript
// Open modal
g2g.openModal();

// Close modal
g2g.closeModal();
```

---

## Backend Integration

### Node.js Token Validation
```javascript
const express = require('express');
const axios = require('axios');

app.get('/api/protected', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const response = await axios.post('https://g-sso.com/auth/validate-token', {
      token
    });

    if (response.data.valid) {
      const user = response.data.user;
      res.json({ message: 'Access granted', user });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(401).json({ error: 'Validation failed' });
  }
});
```

---

## Supported Wallets

### Ethereum (5)
- 🦊 MetaMask
- 💙 Coinbase Wallet
- 🌈 Rainbow
- 🛡️ Trust Wallet
- 🐰 Rabby

### Solana (2)
- 👻 Phantom
- 🔥 Solflare

### Bitcoin (1)
- 🟠 UniSat

### Polkadot (1)
- 🔷 SubWallet

### Cardano (1)
- ♾️ Eternl

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

---

## License

MIT © G2GDAO

---

## Support

- 📧 Email: support@g2gdao.com
- 📖 Docs: https://docs.g2gdao.com
- 💬 Discord: https://discord.gg/g2gdao