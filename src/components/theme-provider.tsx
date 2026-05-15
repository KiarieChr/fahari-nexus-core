import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/store/theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "compact");
    if (mode === "dark") root.classList.add("dark");
    if (mode === "compact") root.classList.add("compact");
  }, [mode]);

  return <>{children}</>;
}
