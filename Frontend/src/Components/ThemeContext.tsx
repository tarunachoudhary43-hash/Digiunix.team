import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from "react";


type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);

    // Apply CSS variables to document root
    const root = document.documentElement;
    if (theme === 'dark') {
      root.style.setProperty('--card-bg', '#1e293b');
      root.style.setProperty('--border', '#334155');
      root.style.setProperty('--text', '#f1f5f9');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--primary', '#6366f1');
      root.style.setProperty('--primary-bg', '#0f172a');
      root.style.setProperty('--success', '#10b981');
      root.style.setProperty('--warning', '#f59e0b');
      root.style.setProperty('--error', '#ef4444');
    } else {
      root.style.setProperty('--card-bg', '#ffffff');
      root.style.setProperty('--border', '#e2e8f0');
      root.style.setProperty('--text', '#1e293b');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--primary', '#6366f1');
      root.style.setProperty('--primary-bg', '#f8fafc');
      root.style.setProperty('--success', '#10b981');
      root.style.setProperty('--warning', '#f59e0b');
      root.style.setProperty('--error', '#ef4444');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
