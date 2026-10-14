// Cria o controle de opção usado no login.

import './ui.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  showLabel?: boolean;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  showLabel = true,
  disabled = false,
}: ToggleProps) {
  return (
    <div className="login-toggle-row">
      {showLabel && <span className="login-toggle-row__label">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`login-toggle ${checked ? 'login-toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="login-toggle__knob" />
      </button>
    </div>
  );
}
