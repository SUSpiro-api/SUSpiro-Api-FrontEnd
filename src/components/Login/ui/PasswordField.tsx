// Cria o campo de senha usado no login.

import type { InputHTMLAttributes } from 'react';
import { usePasswordVisibility } from '../../../hooks/usePasswordVisibility';
import { TextField } from './TextField';
import { MaterialIcon } from '../../icons';

export interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function PasswordField({ label, ...inputProps }: PasswordFieldProps) {
  const { isVisible, toggleVisibility } = usePasswordVisibility();

  return (
    <TextField
      label={label}
      type={isVisible ? 'text' : 'password'}
      startIcon={<MaterialIcon name="lock" size={18} />}
      endSlot={
        <button
          type="button"
          className="login-icon-button"
          onClick={toggleVisibility}
          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={isVisible}
        >
          <MaterialIcon name={isVisible ? 'visibility_off' : 'visibility'} size={18} />
        </button>
      }
      {...inputProps}
    />
  );
}
