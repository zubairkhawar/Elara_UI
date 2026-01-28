/**
 * Utility functions for API calls with automatic token refresh
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('elara_refresh_token');
  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/accounts/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    localStorage.setItem('elara_access_token', data.access);
    // If a new refresh token is provided (token rotation), update it
    if (data.refresh) {
      localStorage.setItem('elara_refresh_token', data.refresh);
    }
    return data.access;
  } catch (err) {
    console.error('Failed to refresh token:', err);
    return null;
  }
}

/**
 * Get authentication headers, refreshing token if needed
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  let token = localStorage.getItem('elara_access_token');
  
  if (!token) {
    return headers;
  }

  // Try to use the current token first
  headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * Make an authenticated API request with automatic token refresh on 401
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();
  
  // Merge headers
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  let response = await fetch(url, requestOptions);

  // If we get a 401, try to refresh the token and retry once
  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();
    
    if (newAccessToken) {
      // Retry the request with the new token
      const retryHeaders: HeadersInit = {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      
      const retryOptions: RequestInit = {
        ...options,
        headers: {
          ...retryHeaders,
          ...options.headers,
        },
      };
      
      response = await fetch(url, retryOptions);
    } else {
      // If refresh failed, clear auth and redirect to login
      localStorage.removeItem('elara_access_token');
      localStorage.removeItem('elara_refresh_token');
      localStorage.removeItem('elara_user');
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return response;
}
