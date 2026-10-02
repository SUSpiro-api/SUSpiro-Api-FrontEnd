import type { ButtonHTMLAttributes } from 'react';
import './ui.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={['login-button', `login-button--${variant}`, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
