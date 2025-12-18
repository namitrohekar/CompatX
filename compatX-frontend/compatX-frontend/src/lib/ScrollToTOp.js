import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis();
    lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
