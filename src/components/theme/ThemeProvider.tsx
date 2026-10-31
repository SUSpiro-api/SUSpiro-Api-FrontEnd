import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AppTheme = 'claro' | 'escuro' | 'suave';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const STORAGE_KEY = 'suspiro.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function readSavedTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'escuro' || saved === 'suave' || saved === 'claro') return saved;
  } catch {
    return 'claro';
  }
  return 'claro';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>(readSavedTheme);

  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = theme;
    html.style.colorScheme = theme === 'escuro' ? 'dark' : 'light';
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // A aplicação continua funcionando quando o navegador bloqueia o armazenamento.
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme precisa ser usado dentro de ThemeProvider.');
  return context;
}
