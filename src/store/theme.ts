import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "compact";

interface ThemeState {
  mode: ThemeMode;
  sidebarCollapsed: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "light",
      sidebarCollapsed: false,
      setMode: (mode) => set({ mode }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: "fahari-theme" }
  )
);