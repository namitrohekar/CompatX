import { useEffect } from "react";
import Lenis from "lenis";

export default function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });

    return () => {
      lenis.destroy();
    };
  }, []);
}
