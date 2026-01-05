import axios from "axios";

const server = import.meta.env.VITE_API_SERVER || "http://localhost:5000";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (
      config.method === "post" ||
      config.method === "put" ||
      config.method === "delete"
    ) {
      const csrfToken = getCSRFToken();

      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let isRefreshingCSRFToken = false;
let failedQueue = [];
let csrfFailedQueue = [];
let currentCsrfToken = null; // Store CSRF token in memory

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const processCSRFQueue = (error, token = null) => {
  csrfFailedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  csrfFailedQueue = [];
};

// Helper to get CSRF token (from memory first, then cookie)
const getCSRFToken = () => {
  return currentCsrfToken || getCookie("csrfToken");
};

// Export function to set CSRF token after login
export const setCSRFToken = (token) => {
  currentCsrfToken = token;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      const errorCode = error.response.data?.code || "";

      if (errorCode.startsWith("CSRF_")) {
        if (isRefreshingCSRFToken) {
          return new Promise((resolve, reject) => {
            csrfFailedQueue.push({ resolve, reject });
          }).then(() => {
            // Use stored CSRF token
            if (currentCsrfToken) {
              originalRequest.headers["x-csrf-token"] = currentCsrfToken;
            }
            return api(originalRequest);
          });
        }
        originalRequest._retry = true;
        isRefreshingCSRFToken = true;

        try {
          const response = await api.post("/api/v1/refresh-csrf");
          // Store CSRF token from response body (cross-origin can't read cookies)
          currentCsrfToken = response.data.csrfToken;
          processCSRFQueue(null);
          if (currentCsrfToken) {
            originalRequest.headers["x-csrf-token"] = currentCsrfToken;
          }
          return api(originalRequest);
        } catch (error) {
          processCSRFQueue(error);
          console.error("Failed to refresh csrf token", error);
          return Promise.reject(error);
        } finally {
          isRefreshingCSRFToken = false;
        }
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/v1/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (error) {
        processQueue(error, null);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
