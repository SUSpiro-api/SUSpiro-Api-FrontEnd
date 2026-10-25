// Cria um controle para ligar ou desligar uma opção.

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
    <label className="ui-toggle-row">
      {showLabel && <span className="ui-toggle-row__label">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={['ui-toggle', checked && 'ui-toggle--on'].filter(Boolean).join(' ')}
        onClick={() => onChange(!checked)}
      >
        <span className="ui-toggle__knob" />
      </button>
    </label>
  );
}
