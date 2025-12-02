# @g2gdao/react-sdk

Official React SDK for G2GDAO Multi-Chain Authentication

## Installation
```bash
npm install @g2gdao/react-sdk
# or
yarn add @g2gdao/react-sdk
```

## Quick Start

### 1. Wrap your app with G2GProvider
```tsx
import { G2GProvider } from '@g2gdao/react-sdk';

function App() {
  return (
    <G2GProvider
      config={{
        clientId: 'cls_your_client_id',
        clientSecret: 'your_client_secret',
        apiUrl: 'https://api.g2gdao.com',
        redirectUri: 'http://localhost:3000/callback',
        flow: 'popup' // or 'redirect'
      }}
    >
      <YourApp />
    </G2GProvider>
  );
}
```

### 2. Use the G2GButton component
```tsx
import { G2GButton } from '@g2gdao/react-sdk';

function LoginPage() {
  return (
    <G2GButton
      onSuccess={() => console.log('Logged in!')}
      onError={(error) => console.error(error)}
    />
  );
}
```

### 3. Access auth state with useG2G hook
```tsx
import { useG2G } from '@g2gdao/react-sdk';

function Dashboard() {
  const { isAuthenticated, user, loading } = useG2G();

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h1>Welcome, {user?.address}</h1>
      <p>Chain: {user?.chainType}</p>
      <p>Points: {user?.points}</p>
      <p>Tier: {user?.tier}</p>
    </div>
  );
}
```

## API Reference

### G2GProvider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `clientId` | `string` | ✅ | Your G2GDAO client ID |
| `clientSecret` | `string` | ✅ | Your G2GDAO client secret |
| `apiUrl` | `string` | ❌ | API URL (default: production) |
| `redirectUri` | `string` | ❌ | OAuth callback URL |
| `flow` | `'popup' \| 'redirect'` | ❌ | Auth flow type (default: 'popup') |
| `chains` | `ChainType[]` | ❌ | Supported chains |

### useG2G Hook

Returns:
```typescript
{
  isAuthenticated: boolean;
  user: G2GUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (options?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  getSession: () => G2GSession | null;
}
```

## License

MIT © G2GDAO