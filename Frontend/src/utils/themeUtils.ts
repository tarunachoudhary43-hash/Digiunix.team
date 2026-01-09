export interface Theme {
  id: string;
  name: string;
  description: string;
  primary: string;
  primaryBg: string;
  gradient: string;
}

export const themes: Theme[] = [
  { id: "royal-indigo", name: "Indigo", description: "Elegant", primary: "#6366f1", primaryBg: "#f5f3ff", gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)" },
  { id: "emerald-glass", name: "Emerald", description: "Fresh", primary: "#10b981", primaryBg: "#ecfdf5", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
  { id: "sunset-glow", name: "Sunset", description: "Warm", primary: "#f59e0b", primaryBg: "#fffbeb", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  { id: "crimson-rush", name: "Crimson", description: "Bold", primary: "#ef4444", primaryBg: "#fef2f2", gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)" },
];

export const applyTheme = (themeId: string) => {
  const theme = themes.find(t => t.id === themeId);
  if (theme) {
    const root = document.documentElement;
    root.style.setProperty("--primary", theme.primary);
    root.style.setProperty("--primary-bg", theme.primaryBg);
    localStorage.setItem("theme", themeId);
  }
};
