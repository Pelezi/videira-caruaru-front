import api, { apiClient } from '@/lib/apiClient';
import { AuthResponse, User } from '@/types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse | { setPasswordUrl: string }> => {
    const response = await api.post<AuthResponse | { setPasswordUrl: string }>('/users/login', { email, password });
    const data = response.data;

    // If backend returned a setPasswordUrl, return it immediately (no token present)
    if (data && typeof data === 'object' && 'setPasswordUrl' in data) {
      return data as { setPasswordUrl: string };
    }

    // From here we expect an AuthResponse shape
    const auth = data as AuthResponse;
    if (auth.token) {
      apiClient.setToken(auth.token);
      if (typeof window !== 'undefined') {
        // Merge top-level permission into the persisted user when present
        const userToPersist = (auth as any).permission
          ? { ...auth.user, permission: (auth as any).permission }
          : auth.user;
        localStorage.setItem('user', JSON.stringify(userToPersist));
      }
    }

    return auth;
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  },

  completeSetup: async (categories: Array<{ name: string; type: 'EXPENSE' | 'INCOME'; subcategories: string[] }>) => {
    const response = await api.post('/users/setup', { categories });
    if (typeof window !== 'undefined' && response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
};
