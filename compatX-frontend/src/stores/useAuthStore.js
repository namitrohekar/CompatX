import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      username: null,
      role: null,
      accessToken: null,     // NOT persisted (in-memory only)
      refreshToken: null,    // persisted

      // Set auth data (called on login)
      setAuth: ({ username, role, accessToken, refreshToken }) =>
        set({
          username,
          role,
          accessToken,
          refreshToken,
        }),

      // Update just the access token (called on refresh)
      updateAccessToken: (token) => set({ accessToken: token }),

      // Logout - clear everything
      logout: () => {
        set({
          username: null,
          role: null,
          accessToken: null,
          refreshToken: null,
        });
        localStorage.removeItem("auth-storage");
        // Redirect to login
        window.location.href = "/login";
      },

      // Check if user is logged in
      isAuthenticated: () => {
        const state = get();
        return !!(state.username && state.role);
      },

      // Check if user is admin
      isAdmin: () => {
        const state = get();
        return state.role === "ADMIN";
      },

      // Rehydrate access token on page refresh
      rehydrateAccessToken: async () => {
        const { accessToken, refreshToken, updateAccessToken, logout } = get();

        if (accessToken) return; // already valid in memory
        if (!refreshToken) return; // nothing to do

        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
            null,
            {
              params: { refreshToken },
            }
          );

          updateAccessToken(res.data.accessToken);
          console.log("✅ Access token refreshed on page load");

        } catch (error) {
          // ✅ CRITICAL FIX: Only logout on auth failures (401/403)
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.error("❌ Refresh token invalid/expired. Logging out...");
            logout();
            return;
          }

          // For server errors (5xx) or network errors, keep user logged in
          // They can still navigate the app and will get fresh token on next API call
          console.warn("⚠️ Could not refresh on page load (server error). User stays logged in.");
          console.warn("   User will get fresh token on next API request.");
        }
      },
    }),

    {
      name: "auth-storage",
      // Only persist these fields (not accessToken)
      partialize: (state) => ({
        username: state.username,
        role: state.role,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

export default useAuthStore;