import { useId, type SelectHTMLAttributes } from 'react';
import './ui.css';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
}

export function SelectField({ label, hint, id, children, ...selectProps }: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;

  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={selectId}>
        {label}
      </label>

      {hint && (
        <p id={hintId} className="ui-field__hint">
          {hint}
        </p>
      )}

      <div className="ui-field__control ui-field__control--select">
        <select
          id={selectId}
          className="ui-field__input ui-field__select"
          aria-describedby={hint ? hintId : undefined}
          {...selectProps}
        >
          {children}
        </select>
      </div>
    </div>
  );
}
