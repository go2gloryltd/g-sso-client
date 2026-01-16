// src/core/SessionManager.ts
import type { Session } from '../types';

type StorageType = 'localStorage' | 'sessionStorage' | 'cookie';

export class SessionManager {
  private storageType: StorageType;
  private storageKey: string = 'gsso_session_token';

  constructor(storageType: StorageType = 'localStorage') {
    this.storageType = storageType;
  }

  /**
   * Save session
   */
  saveSession(session: Session): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(this.storageKey, session.token);
        
        // Also save user data for quick access
        storage.setItem(`${this.storageKey}_user`, JSON.stringify(session.user));
        storage.setItem(`${this.storageKey}_expires`, session.expiresAt);
      } else if (this.storageType === 'cookie') {
        this.setCookie(this.storageKey, session.token, session.expiresAt);
      }
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  /**
   * Get session token
   */
  getToken(): string | null {
    try {
      const storage = this.getStorage();
      if (storage) {
        return storage.getItem(this.storageKey);
      } else if (this.storageType === 'cookie') {
        return this.getCookie(this.storageKey);
      }
    } catch (error) {
      console.error('Failed to get token:', error);
    }
    return null;
  }

  /**
   * Get full session
   */
  getSession(): Session | null {
    try {
      const token = this.getToken();
      if (!token) return null;

      const storage = this.getStorage();
      if (storage) {
        const userStr = storage.getItem(`${this.storageKey}_user`);
        const expiresAt = storage.getItem(`${this.storageKey}_expires`);

        if (!userStr || !expiresAt) return null;

        // Check expiration
        if (new Date(expiresAt) < new Date()) {
          this.clearSession();
          return null;
        }

        return {
          token,
          user: JSON.parse(userStr),
          expiresAt
        };
      }
    } catch (error) {
      console.error('Failed to get session:', error);
    }
    return null;
  }

  /**
   * Clear session
   */
  clearSession(): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(this.storageKey);
        storage.removeItem(`${this.storageKey}_user`);
        storage.removeItem(`${this.storageKey}_expires`);
      } else if (this.storageType === 'cookie') {
        this.deleteCookie(this.storageKey);
      }
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Check if session is valid
   */
  isSessionValid(): boolean {
    const session = this.getSession();
    if (!session) return false;

    try {
      return new Date(session.expiresAt) > new Date();
    } catch {
      return false;
    }
  }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private getStorage(): Storage | null {
    if (typeof window === 'undefined') return null;

    switch (this.storageType) {
      case 'localStorage':
        return window.localStorage;
      case 'sessionStorage':
        return window.sessionStorage;
      default:
        return null;
    }
  }

  private setCookie(name: string, value: string, expiresAt: string): void {
    if (typeof document === 'undefined') return;

    const expires = new Date(expiresAt);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  private deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}