import axios from "axios";
import useAuthStore from "../stores/useAuthStore";
import { toast } from "sonner";

const axiosClient = axios.create({
   baseURL: import.meta.env.VITE_API_URL + "/api/v1",
});

// ============================================
// CONCURRENT REFRESH GUARD
// Prevents multiple simultaneous refresh requests
// ============================================
let refreshPromise = null;

const resetRefreshPromise = () => {
  refreshPromise = null;
};

// ============================================
// RETRY HELPER WITH EXPONENTIAL BACKOFF
// Retries failed requests for server errors only
// ============================================
const retryWithBackoff = async (fn, retriesLeft = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retriesLeft === 0) {
      throw error;
    }

    // Don't retry on auth errors (401, 403)
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw error;
    }

    // Retry on 5xx or network errors
    console.log(`⚠️ Retrying... (${retriesLeft} attempts left, waiting ${delay}ms)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retriesLeft - 1, delay * 2);
  }
};

// ============================================
// REQUEST INTERCEPTOR
// Attach Bearer token (but NOT for login/register)
// ============================================
axiosClient.interceptors.request.use((config) => {
  // Don't attach token to login/register endpoints
  const isAuthEndpoint =
    config.url?.includes("/auth/login") || config.url?.includes("/register");

  if (!isAuthEndpoint) {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  return config;
});

// ============================================
// RESPONSE INTERCEPTOR
// Handle 401 with token refresh, retry on 5xx
// ============================================
axiosClient.interceptors.response.use(
  (res) => res,

  async (error) => {
    const original = error.config;

    // ✅ Don't intercept auth errors for login/register endpoints
    // Let the Login component handle these errors to display proper error messages
    const isAuthEndpoint =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/register");

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // ============================================
    // HANDLE 401 UNAUTHORIZED - TOKEN REFRESH
    // ============================================
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      // If refresh is already in progress, wait for it
      if (refreshPromise) {
        try {
          await refreshPromise;
          // Retry original request with new token
          const newToken = useAuthStore.getState().accessToken;
          if (newToken) {
            original.headers.Authorization = `Bearer ${newToken}`;
            return axiosClient(original);
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }

      // Start new refresh
      refreshPromise = (async () => {
        const { refreshToken, updateAccessToken, logout } =
          useAuthStore.getState();

        if (!refreshToken) {
          console.warn("⚠️ No refresh token available. Logging out...");
          logout();
          throw new Error("No refresh token");
        }

        try {
          const res = await axios.get(
            `http://localhost:8080/api/v1/auth/refresh`,
            {
              params: { refreshToken },
            }
          );

          const newToken = res.data.accessToken;
          updateAccessToken(newToken);
          console.log("✅ Access token refreshed successfully");
          return newToken;

        } catch (err) {
          // ✅ CRITICAL FIX: Only logout on auth failures (401/403)
          if (err.response?.status === 401 || err.response?.status === 403) {
            console.error("❌ Refresh token invalid/expired. Logging out...");
            logout();
            throw err;
          }

          // For server errors (5xx) or network errors, don't logout
          console.warn("⚠️ Refresh failed due to server error. User stays logged in.");
          toast.warning("Server temporarily unavailable. Please try again.");
          throw err;

        } finally {
          resetRefreshPromise();
        }
      })();

      try {
        const newToken = await refreshPromise;
        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(original);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // ============================================
    // HANDLE 5XX SERVER ERRORS - RETRY
    // ============================================
    if (error.response?.status >= 500) {
      console.warn(`⚠️ Server error (${error.response.status}). Will retry...`);
      toast.error("Server error. Retrying...");
      
      try {
        return await retryWithBackoff(() => axiosClient(original), 2);
      } catch (retryError) {
        toast.error("Server is temporarily unavailable. Please try again later.");
        return Promise.reject(retryError);
      }
    }

    // ============================================
    // HANDLE NETWORK ERRORS - RETRY
    // ============================================
    if (!error.response) {
      console.warn("⚠️ Network error. Will retry...");
      toast.error("Network error. Retrying...");
      
      try {
        return await retryWithBackoff(() => axiosClient(original), 2);
      } catch (retryError) {
        toast.error("Cannot connect to server. Please check your connection.");
        return Promise.reject(retryError);
      }
    }

    // For all other errors (400, 403, 404, etc.), just reject without logout
    // This allows components to handle validation errors, not found errors, etc.
    return Promise.reject(error);
  }
);

export default axiosClient;
