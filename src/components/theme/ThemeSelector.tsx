import { MaterialIcon } from '../icons';
import { useAppTheme, type AppTheme } from './ThemeProvider';

const themes: Array<{ value: AppTheme; label: string; icon: 'light_mode' | 'dark_mode' | 'tonality' }> = [
  { value: 'claro', label: 'Branco', icon: 'light_mode' },
  { value: 'escuro', label: 'Preto', icon: 'dark_mode' },
  { value: 'suave', label: 'Suave', icon: 'tonality' },
];

export function ThemeSelector() {
  const { theme, setTheme } = useAppTheme();

  return (
    <div className="theme-selector" role="group" aria-label="Tema do sistema">
      {themes.map((option) => (
        <button
          key={option.value}
          type="button"
          className="theme-selector__button"
          aria-label={`Tema ${option.label.toLowerCase()}`}
          aria-pressed={theme === option.value}
          title={`Tema ${option.label.toLowerCase()}`}
          onClick={() => setTheme(option.value)}
        >
          <MaterialIcon name={option.icon} size={18} />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
