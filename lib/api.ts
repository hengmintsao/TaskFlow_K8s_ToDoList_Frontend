const DEFAULT_BROWSER_API_PORT = '8000';
const DEFAULT_SERVER_API_URL = 'http://localhost:8000';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getApiBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configured) {
    if (typeof window === 'undefined') {
      return DEFAULT_SERVER_API_URL;
    }

    return `${window.location.protocol}//${window.location.hostname}:${DEFAULT_BROWSER_API_PORT}`;
  }

  if (configured.startsWith('/')) {
    return trimTrailingSlash(configured);
  }

  try {
    const url = new URL(configured);

    if (typeof window !== 'undefined' && (url.hostname === 'api' || url.hostname === 'backend')) {
      url.hostname = window.location.hostname || 'localhost';
    }

    return trimTrailingSlash(url.toString());
  } catch {
    return typeof window === 'undefined'
      ? DEFAULT_SERVER_API_URL
      : `${window.location.protocol}//${window.location.hostname}:${DEFAULT_BROWSER_API_PORT}`;
  }
};

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};

export const readErrorMessage = async (response: Response, fallback: string) => {
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const data = (await response.json()) as { detail?: unknown; message?: unknown };

      if (typeof data.detail === 'string') return data.detail;
      if (typeof data.message === 'string') return data.message;
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object' && 'msg' in item && typeof item.msg === 'string') {
              return item.msg;
            }
            return null;
          })
          .filter(Boolean)
          .join('; ') || fallback;
      }
    }

    const text = await response.text();
    return text.trim() || fallback;
  } catch {
    return fallback;
  }
};
