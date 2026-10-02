import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { brand } from '../../config/brand';
import { canAccessProfessionalDashboard } from '../../features/auth/authorization';
import { perfilLabel } from '../../features/auth/perfil';
import type { AuthUser } from '../../features/auth/types';
import { maskCpf } from '../../utils/mask';
import { LogoMark, MaterialIcon } from '../icons';
import { Button } from '../ui/Button';
import { getNavItems, getProfessionalNavItems } from './navigation';
import './layout.css';

interface AppShellProps {
  /** Caminho atual, para destacar o item ativo do menu. */
  current: string;
  user: AuthUser | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  children: ReactNode;
}

/** Estrutura das telas logadas: menu lateral (gaveta no celular), barra superior e conteúdo. */
export function AppShell({ current, user, onNavigate, onLogout, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const items = getNavItems(user?.perfil);
  const isProfessionalDashboard = current === '/dashboard' && canAccessProfessionalDashboard(user?.perfil);
  const professionalNavItems = getProfessionalNavItems(user?.perfil);
  const isSchedulingDashboard = user?.perfil === 'ENFERMEIRO' || user?.perfil === 'RECEPCIONISTA';

  // Ao trocar de tela, leva o foco ao conteúdo: leitores de tela percebem a mudança.
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [current]);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>, path: string) => {
    // Cliques com modificador (abrir em nova aba) seguem o comportamento normal do link.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    event.preventDefault();
    setMenuOpen(false);

    if (path.startsWith('#')) {
      const targetId = path.slice(1);
      const target = document.getElementById(targetId);

      // Mantém o comportamento nativo de âncoras: atualiza o hash e posiciona
      // o usuário exatamente na seção escolhida. Para o atalho de atendimento,
      // o DashboardPage também reage ao hash e abre a busca do paciente.
      if (window.location.hash === path) {
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } else {
        window.location.hash = targetId;
      }
      return;
    }

    onNavigate(path);
  };

  return (
    <div className="shell">
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>

      <aside
        id="shell-sidebar"
        className={[
          'shell__sidebar',
          isProfessionalDashboard && 'shell__sidebar--professional',
          menuOpen && 'shell__sidebar--open',
        ].filter(Boolean).join(' ')}
      >
        <div className="shell__brand">
          <LogoMark className="shell__logo" aria-hidden="true" />
          <div className="shell__brand-copy">
            <span className="shell__brand-name">{brand.name}</span>
            {isProfessionalDashboard && <span className="shell__brand-context">Atendimento</span>}
          </div>
        </div>

        {isProfessionalDashboard ? (
          <div className="shell__professional-content">
            <nav aria-label="Navegação do atendimento">
              <p className="shell__section-label">{isSchedulingDashboard ? 'Agendamento' : 'Atendimento'}</p>
              <ul className="shell__nav">
                {professionalNavItems.map((item) => {
                  const active = item.path === current;
                  const isAnchor = item.path.startsWith('#');

                  return (
                    <li key={item.path}>
                      <a
                        href={item.path}
                        className={['shell__link', active && 'shell__link--active']
                          .filter(Boolean)
                          .join(' ')}
                        aria-current={active ? 'page' : undefined}
                        onClick={(event) => handleNavigate(event, item.path)}
                        {...(isAnchor ? { 'data-dashboard-anchor': item.path.slice(1) } : {})}
                      >
                        <MaterialIcon name={item.icon} size={20} />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        ) : (
          <nav aria-label="Navegação principal">
            <ul className="shell__nav">
              {items.map((item) => {
                const active = item.path === current;

                return (
                  <li key={item.path}>
                    <a
                      href={item.path}
                      className={['shell__link', active && 'shell__link--active']
                        .filter(Boolean)
                        .join(' ')}
                      aria-current={active ? 'page' : undefined}
                      onClick={(event) => handleNavigate(event, item.path)}
                    >
                      <MaterialIcon name={item.icon} size={20} />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        {isProfessionalDashboard && (
          <section className="shell__profile" aria-labelledby="shell-profile-title">
            <div className="shell__profile-avatar" aria-hidden="true">
              <MaterialIcon name="person" size={20} />
            </div>
            <div className="shell__profile-copy">
              <p id="shell-profile-title">{user?.nome ?? perfilLabel(user?.perfil)}</p>
              <span>{perfilLabel(user?.perfil)}</span>
              {user?.sub && <span>{maskCpf(user.sub)}</span>}
            </div>
            <button type="button" className="shell__logout" onClick={onLogout}>
              <MaterialIcon name="logout" size={18} />
              <span>Sair</span>
            </button>
          </section>
        )}
      </aside>

      {menuOpen && <div className="shell__overlay" onClick={() => setMenuOpen(false)} />}

      <div className="shell__body">
        <header className={['shell__topbar', isProfessionalDashboard && 'shell__topbar--professional'].filter(Boolean).join(' ')}>
          <button
            type="button"
            className="ui-icon-button shell__menu-button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="shell-sidebar"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MaterialIcon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>

          {isProfessionalDashboard ? (
            <div className="shell__professional-topbar-spacer" aria-hidden="true" />
          ) : (
            <>
              <div className="shell__user">
                <span className="shell__avatar" aria-hidden="true">
                  <MaterialIcon name="person" size={20} />
                </span>
                <span className="shell__user-text">
                  <strong>{user?.nome ?? perfilLabel(user?.perfil)}</strong>
                  <span>{perfilLabel(user?.perfil)}{user?.sub ? ` · ${maskCpf(user.sub)}` : ''}</span>
                </span>
              </div>

              <Button variant="secondary" onClick={onLogout}>
                <MaterialIcon name="logout" size={18} />
                Sair
              </Button>
            </>
          )}
        </header>

        <main id="conteudo" ref={mainRef} tabIndex={-1} className="shell__main">
          {children}
        </main>
      </div>
    </div>
  );
}
