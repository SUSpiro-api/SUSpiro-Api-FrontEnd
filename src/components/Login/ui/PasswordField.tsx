// Cria o campo de senha usado no login.

import { useState, type InputHTMLAttributes } from 'react';
import { TextField } from './TextField';
import { MaterialIcon } from '../../icons';

export interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

export function PasswordField({ label, ...inputProps }: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TextField
      label={label}
      type={isVisible ? 'text' : 'password'}
      startIcon={<MaterialIcon name="lock" size={18} />}
      endSlot={
        <button
          type="button"
          className="login-icon-button"
          onClick={() => setIsVisible((previous) => !previous)}
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
