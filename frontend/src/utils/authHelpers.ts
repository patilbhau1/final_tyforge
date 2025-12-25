/**
 * Authentication Helper Functions
 * Handles both JWT-based auth and Supabase Google OAuth
 */

export const AUTH_TOKEN_KEY = 'tyforge_token';
export const USER_ID_KEY = 'user_id';

/**
 * Store authentication token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Get authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Remove authentication token
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Logout user
 */
export const logout = (): void => {
  removeAuthToken();
  window.location.href = '/login';
};

/**
 * Handle authentication redirect
 */
export const redirectIfNotAuthenticated = (): boolean => {
  if (!isAuthenticated()) {
    window.location.href = '/login';
    return false;
  }
  return true;
};
