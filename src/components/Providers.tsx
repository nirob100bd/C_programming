"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

function syncTheme() {
  const theme = localStorage.getItem("theme") ?? "system";
  const dark = theme === "dark" || (
    theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  document.documentElement.classList.toggle("dark", dark);
}

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    syncTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if ((localStorage.getItem("theme") ?? "system") === "system") syncTheme();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}
