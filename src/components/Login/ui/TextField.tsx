// Cria os campos de texto usados no login.

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import './ui.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  startIcon?: ReactNode;
  endSlot?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, startIcon, endSlot, id, className, ...inputProps }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="login-field">
        <label className="login-field__label" htmlFor={inputId}>
          {label}
        </label>

        <div className="login-field__control">
          {startIcon && (
            <span className="login-field__icon login-field__icon--start">
              {startIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              'login-field__input',
              startIcon && 'login-field__input--with-start-icon',
              endSlot && 'login-field__input--with-end-icon',
              className,
            ].filter(Boolean).join(' ')}
            {...inputProps}
          />

          {endSlot && (
            <span className="login-field__icon login-field__icon--end">
              {endSlot}
            </span>
          )}
        </div>
      </div>
    );
  },
);

TextField.displayName = 'TextField';
