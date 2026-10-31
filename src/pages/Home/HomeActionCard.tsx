import type { MouseEvent } from 'react';
import { MaterialIcon } from '../../components/icons';
import type { HomeAction } from './hooks/useHomePage';

interface HomeActionCardProps {
  action: HomeAction;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export function HomeActionCard({ action, onClick }: HomeActionCardProps) {
  return (
    <li>
      <a className="action-card" href={action.path} onClick={onClick}>
        <span className="action-card__icon" aria-hidden="true"><MaterialIcon name={action.icon} size={24} /></span>
        <span className="action-card__title">{action.title}</span>
        <span className="action-card__text">{action.text}</span>
        <span className="action-card__cta">Abrir <MaterialIcon name="arrow_forward" size={16} /></span>
      </a>
    </li>
  );
}
