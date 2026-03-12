import { jwtDecode } from "jwt-decode";

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
  }
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
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

// helper to call backend auth endpoints
// default to localhost when running outside of Docker
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const loginUser = async (email: string, password: string) => {
  const body = new URLSearchParams();
  body.append('username', email);
  body.append('password', password);

  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    throw new Error('Login failed');
  }
  const data = await res.json();
  setToken(data.access_token);
  return data;
};

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    let errMsg = 'Registration failed';
    try {
      const err = await res.json();
      // handle pydantic validation errors
      if (err.detail && Array.isArray(err.detail)) {
        errMsg = err.detail.map((d: any) => `${d.loc?.[1] || 'Field'}: ${d.msg}`).join('; ');
      } else if (err.detail) {
        errMsg = String(err.detail);
      }
    } catch (_e) {
      // maybe HTML response, ignore
    }
    throw new Error(errMsg);
  }
  return await res.json();
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return await res.json();
};
