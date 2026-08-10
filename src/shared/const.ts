export const OAUTH_STATE_COOKIE = '__host_oauth_state';
export const COOKIE_NAME = 'manus-cookie';
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const UNAUTHED_ERR_MSG = 'Unauthorized';

export function encodeOAuthState(payload: { redirectUri: string; nonce: string }) {
  return btoa(JSON.stringify(payload));
}
