import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../stores/useAuthStore";

export default function TokenBootstrap({ children }) {
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const accessToken = useAuthStore((s) => s.accessToken);
  const updateAccessToken = useAuthStore((s) => s.updateAccessToken);
  const logout = useAuthStore((s) => s.logout);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!accessToken && refreshToken) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
            null,
            { params: { refreshToken } }
          );
          updateAccessToken(res.data.accessToken);
        } catch (err) {
          logout();
        }
      }

      setReady(true);
    };

    init();
  }, []);

  if (!ready) return null; // prevents router load before token refresh completes
  return children;
}
