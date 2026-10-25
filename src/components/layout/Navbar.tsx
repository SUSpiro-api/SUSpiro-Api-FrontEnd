// Mostra uma lista de links de navegação.

import type { MouseEvent } from 'react';
import { MaterialIcon } from '../icons';
import type { NavItem } from './navigation';

interface NavbarProps {
  items: NavItem[];
  current: string;
  label: string;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, path: string) => void;
  sectionTitle?: string;
}

export function Navbar({ items, current, label, onNavigate, sectionTitle }: NavbarProps) {
  return (
    <nav aria-label={label}>
      {sectionTitle && <p className="shell__section-label">{sectionTitle}</p>}
      <ul className="shell__nav">
        {items.map((item) => {
          const active = item.path === current;

          return (
            <li key={item.path}>
              <a
                href={item.path}
                className={['shell__link', active && 'shell__link--active'].filter(Boolean).join(' ')}
                aria-current={active ? 'page' : undefined}
                onClick={(event) => onNavigate(event, item.path)}
              >
                <MaterialIcon name={item.icon} size={20} />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
