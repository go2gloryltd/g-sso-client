// src/vue.ts - Vue 3 composable for G-SSO SDK
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { GSSO } from './core/GSSO';
import type { GSSORConfig, User } from './types';

let sdkInstance: GSSO | null = null;

/**
 * Initialize G-SSO SDK (call once in main.ts/app.vue)
 */
export function initGSSO(config: Partial<GSSORConfig>): GSSO {
  if (!sdkInstance) {
    sdkInstance = GSSO.init(config);
  }
  return sdkInstance;
}

/**
 * Get G-SSO SDK instance
 */
export function getGSSO(): GSSO {
  if (!sdkInstance) {
    throw new Error('G-SSO not initialized. Call initGSSO() first.');
  }
  return sdkInstance;
}

/**
 * Vue 3 composable for G-SSO
 * 
 * Usage:
 * ```vue
 * <script setup>
 * import { useGSSO } from '@gsso/sdk/vue';
 * 
 * const { user, isAuthenticated, connect, logout } = useGSSO();
 * </script>
 * ```
 */
export function useGSSO() {
  const sdk = getGSSO();
  
  const user = ref<User | null>(null);
  const isLoading = ref(true);
  const error = ref<Error | null>(null);

  // Computed
  const isAuthenticated = computed(() => user.value !== null);

  // Methods
  const connect = async () => {
    isLoading.value = true;
    error.value = null;
    // Connection handled by ConnectWallet component
  };

  const disconnect = async () => {
    await sdk.logout();
  };

  const logout = async () => {
    await sdk.logout();
  };

  const logoutAll = async () => {
    await sdk.logoutAll();
  };

  const refreshToken = async () => {
    try {
      await sdk.refreshToken();
    } catch (err) {
      error.value = err as Error;
      throw err;
    }
  };

  // Event handlers
  const handleAuthenticated = (authenticatedUser: User) => {
    user.value = authenticatedUser;
    isLoading.value = false;
    error.value = null;
  };

  const handleLogout = () => {
    user.value = null;
    isLoading.value = false;
  };

  const handleError = (err: Error) => {
    error.value = err;
    isLoading.value = false;
  };

  // Lifecycle
  onMounted(async () => {
    // Setup listeners
    sdk.on('authenticated', handleAuthenticated);
    sdk.on('logout', handleLogout);
    sdk.on('error', handleError);

    // Check existing session
    try {
      const session = await sdk.getSession();
      if (session) {
        user.value = session.user;
      }
    } catch (err) {
      console.error('Session initialization error:', err);
    } finally {
      isLoading.value = false;
    }
  });

  onUnmounted(() => {
    sdk.off('authenticated', handleAuthenticated);
    sdk.off('logout', handleLogout);
    sdk.off('error', handleError);
  });

  return {
    sdk,
    user,
    isAuthenticated,
    isLoading,
    error,
    connect,
    disconnect,
    logout,
    logoutAll,
    refreshToken
  };
}

// ============================================================================
// RE-EXPORT CORE
// ============================================================================

export { GSSO } from './core/GSSO';
export { WalletDetector } from './core/WalletDetector';
export { WalletConnector } from './core/WalletConnector';
export * from './types';

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  initGSSO,
  getGSSO,
  useGSSO
};