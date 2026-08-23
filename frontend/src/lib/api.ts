import axios from 'axios';

// Simple Axios instance for the frontend with JWT handling.
// - Attaches access token from localStorage (accessToken)
// - On 401 with a refresh token available, attempts refresh via /api/auth/refresh
// - Exposes a typed instance for use across the app

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to requests
client.interceptors.request.use((config) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore (SSR or security locked storage)
  }
  return config;
});

// Response interceptor to attempt refresh on 401
let isRefreshing = false;
let refreshQueue: Array<(token?: string | null) => void> = [];

async function refreshAccessToken() {
  try {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) return null;

    const resp = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    const { data } = resp;
    if (data?.data?.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      return data.data.accessToken as string;
    }
  } catch (err) {
    console.warn('Refresh token failed', err);
  }
  return null;
}

client.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    const status = error?.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token?: string | null) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(client(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      // flush queue
      refreshQueue.forEach((cb) => cb(newToken));
      refreshQueue = [];

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default client;
