import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { MaterialIcon } from '../icons';
import './ui.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;

  hint?: string;

  error?: string;
  startIcon?: ReactNode;
  endSlot?: ReactNode;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, startIcon, endSlot, id, className, ...inputProps }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    const describedBy =
      [hint && hintId, error && errorId, inputProps['aria-describedby']]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
      <div className={['ui-field', error && 'ui-field--invalid'].filter(Boolean).join(' ')}>
        <label className="ui-field__label" htmlFor={inputId}>
          {label}
        </label>

        {hint && (
          <p id={hintId} className="ui-field__hint">
            {hint}
          </p>
        )}

        <div className="ui-field__control">
          {startIcon && (
            <span className="ui-field__icon ui-field__icon--start">{startIcon}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              'ui-field__input',
              startIcon && 'ui-field__input--with-start-icon',
              endSlot && 'ui-field__input--with-end-icon',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            {...inputProps}
            aria-invalid={error ? true : inputProps['aria-invalid']}
            aria-describedby={describedBy}
          />

          {endSlot && <span className="ui-field__icon ui-field__icon--end">{endSlot}</span>}
        </div>

        {error && (
          <p id={errorId} className="ui-field__error" role="alert">
            <MaterialIcon name="error" size={16} />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
