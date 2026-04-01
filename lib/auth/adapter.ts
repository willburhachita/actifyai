/**
 * Auth adapter interface.
 * Isolates provider-specific auth internals from visual components.
 * Currently backed by Auth0 v4, but swappable.
 */
export interface AuthAdapter {
  getLoginUrl: () => string;
  getLogoutUrl: () => string;
  getCallbackUrl: () => string;
}

export const auth0Adapter: AuthAdapter = {
  getLoginUrl: () => "/auth/login",
  getLogoutUrl: () => "/auth/logout",
  getCallbackUrl: () => "/auth/callback",
};
