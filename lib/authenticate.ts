import { jwtDecode } from "jwt-decode";
import { buildApiUrl, readErrorMessage } from "@/lib/api";

interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decode JWT token
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("token");
};

/**
 * Set token to localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    window.dispatchEvent(new Event('auth-changed'));
  }
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event('auth-changed'));
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) {
    return false;
  }
  return !isTokenExpired(token);
};

/**
 * Get user from token
 */
export const getUserFromToken = (): DecodedToken | null => {
  const token = getToken();
  if (!token) {
    return null;
  }
  
  if (isTokenExpired(token)) {
    removeToken();
    return null;
  }
  
  return decodeToken(token);
};

/**
 * Logout user
 */
export const logout = (): void => {
  removeToken();
};

export const loginUser = async (email: string, password: string) => {
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  const res = await fetch(buildApiUrl('/api/v1/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Login failed'));
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await fetch(buildApiUrl('/api/v1/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, 'Registration failed'));
  }
  return await res.json();
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(buildApiUrl('/api/v1/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return await res.json();
};
