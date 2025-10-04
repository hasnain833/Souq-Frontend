import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from '../utils/TokenStorage';

// ✅ Base URL setup
const resolvedBaseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true, // allow cookies (refresh token, etc.)
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ✅ Attach access token to every request and normalize URL
axiosInstance.interceptors.request.use(
  (config) => {
    // Normalize path to avoid double '/api' if baseURL already includes it
    try {
      const base = axiosInstance.defaults.baseURL || '';
      let url = config.url || '';

      const baseEndsWithApi = /\/api\/?$/i.test(base);
      const urlStartsWithApi = /^\/?api\b/i.test(url);

      if (baseEndsWithApi && urlStartsWithApi) {
        // remove leading '/api' once
        url = url.replace(/^\/?api\/?/i, '/');
      }

      // Ensure single leading slash
      if (typeof url === 'string' && !url.startsWith('/')) {
        url = '/' + url;
      }

      config.url = url;
    } catch (_) {
      // ignore normalization errors
    }

    if (config.withAuth !== false) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle expired tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // 🚨 Use raw axios, not axiosInstance (avoid attaching expired token)
        const response = await axios.post(
          `${resolvedBaseURL}/api/user/auth/refresh-token`,
          { token: getRefreshToken() },
          { withCredentials: true }
        );

        const { accessToken, refreshToken } = response.data.data;

        // ✅ Save new tokens
        saveTokens({ accessToken, refreshToken });

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("❌ Refresh token failed:", err.response?.data || err.message);
        processQueue(err, null);
        clearTokens();
        window.location.href = '/'; // force login
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
