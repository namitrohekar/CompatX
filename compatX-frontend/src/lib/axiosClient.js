import axios from "axios";
import useAuthStore from "../stores/useAuthStore";
import { toast } from "sonner";

// const axiosClient = axios.create({
//   baseURL: import.meta.env.VITE_API_URL + "/api/v1",
// });

const useAws = import.meta.env.VITE_USE_AWS === "true";

const baseApiUrl = useAws
  ? import.meta.env.VITE_API_URL_AWS
  : import.meta.env.VITE_API_URL_RENDER;

const axiosClient = axios.create({
  baseURL: baseApiUrl + "/api/v1",
});


// GLOBAL FLAGS

let refreshPromise = null;
let backendDownNotified = false;

const resetRefreshPromise = () => {
  refreshPromise = null;
};

// REQUEST INTERCEPTOR
// Attach Bearer token (except auth endpoints)

axiosClient.interceptors.request.use((config) => {
  const isAuthEndpoint =
    config.url?.includes("/auth/login") ||
    config.url?.includes("/register") ||
    config.url?.includes("/auth/refresh");

  if (!isAuthEndpoint) {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

// RESPONSE INTERCEPTOR

axiosClient.interceptors.response.use(
  (res) => res,

  async (error) => {
    const original = error.config;

    // BACKEND DOWN / NETWORK ERROR

    if (!error.response) {
      if (!backendDownNotified) {
        backendDownNotified = true;
        toast.error("Backend is not available. Some features may not work.");
      }
      return Promise.reject(error);
    }

    const status = error.response.status;

    // AUTH ENDPOINTS — LET COMPONENTS HANDLE ERRORS

    const isAuthEndpoint =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/register");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // 401 UNAUTHORIZED — TOKEN REFRESH FLOW

    if (status === 401 && !original._retry) {
      original._retry = true;

      // Wait if refresh already in progress
      if (refreshPromise) {
        try {
          await refreshPromise;
          const newToken = useAuthStore.getState().accessToken;
          if (newToken) {
            original.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(original);
          }
        } catch {
          return Promise.reject(error);
        }
      }

      refreshPromise = (async () => {
        const { refreshToken, updateAccessToken, logout } =
          useAuthStore.getState();

        if (!refreshToken) {
          logout();
          throw new Error("No refresh token");
        }

        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
            null,
            { params: { refreshToken } }
          );

          updateAccessToken(res.data.accessToken);
          return res.data.accessToken;
        } catch (err) {
          if (err.response?.status === 401 || err.response?.status === 403) {
            logout();
          }
          throw err;
        } finally {
          resetRefreshPromise();
        }
      })();

      try {
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(original);
      } catch {
        return Promise.reject(error);
      }
    }

    // 5XX SERVER ERRORS — NO RETRY, NO SPAM

    if (status >= 500) {
      if (!backendDownNotified) {
        backendDownNotified = true;
        toast.error("Server is temporarily unavailable.");
      }
      return Promise.reject(error);
    }

    // OTHER ERRORS (400, 403, 404)
    // Let components handle them

    return Promise.reject(error);
  }
);

export default axiosClient;
