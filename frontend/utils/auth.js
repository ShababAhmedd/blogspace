export const TOKEN_KEY = "blogspace_token";

export const getToken = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // storage unavailable (private mode); the session just won't persist
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
};

// reads the JWT payload without verifying it; the backend still verifies every request
const readPayload = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

// expiry time in milliseconds, or null if the token has none
export const getTokenExpiry = (token) => {
  const exp = readPayload(token)?.exp;
  return exp ? exp * 1000 : null;
};

export const getTokenUserId = (token) => readPayload(token)?.id ?? null;

export const isTokenExpired = (token) => {
  const expiresAt = getTokenExpiry(token);
  return !expiresAt || expiresAt <= Date.now();
};
