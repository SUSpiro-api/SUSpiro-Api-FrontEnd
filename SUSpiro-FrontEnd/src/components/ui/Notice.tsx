import type { ReactNode } from 'react';
import { MaterialIcon } from '../icons';
import './ui.css';

interface NoticeProps {
  variant?: 'error' | 'success' | 'info';
  title?: string;
  children: ReactNode;
}

const ICONS = { error: 'error', success: 'check_circle', info: 'info' } as const;

/** Erros são anunciados na hora (alert); sucesso e informação, sem interromper (status). */
export function Notice({ variant = 'info', title, children }: NoticeProps) {
  return (
    <div
      className={`ui-notice ui-notice--${variant}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <MaterialIcon name={ICONS[variant]} size={20} className="ui-notice__icon" />
      <div className="ui-notice__body">
        {title && <p className="ui-notice__title">{title}</p>}
        <p className="ui-notice__text">{children}</p>
      </div>
    </div>
  );
}
