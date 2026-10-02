import { MaterialIcon, type MaterialIconName } from '../../components/icons';
import { Notice } from '../../components/ui/Notice';
import { brand } from '../../config/brand';
import { canAccessProfessionalDashboard, canCreatePatient, isAdmin } from '../../features/auth/authorization';
import { perfilLabel } from '../../features/auth/perfil';
import { getCurrentUser } from '../../features/auth/token';
import '../../components/layout/layout.css';
import './HomePage.css';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

interface HomeAction {
  path: string;
  icon: MaterialIconName;
  title: string;
  text: string;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const perfil = getCurrentUser()?.perfil;

  const actions: HomeAction[] = [];

  if (canAccessProfessionalDashboard(perfil)) {
    actions.push({
      path: '/dashboard',
      icon: 'dashboard',
      title: 'Dashboard profissional',
      text: 'Acompanhe consultas, exames, encaminhamentos e pendências da unidade.',
    });
  }

  if (canCreatePatient(perfil)) {
    actions.push({
      path: '/cadastro-cidadao',
      icon: 'person_add',
      title: 'Cadastrar cidadão',
      text: 'Registre um novo cidadão com CPF, data de nascimento e Cartão Nacional de Saúde.',
    });
  }

  if (isAdmin(perfil)) {
    actions.push({
      path: '/cadastro-funcionario',
      icon: 'group',
      title: 'Cadastrar funcionário',
      text: 'Crie o acesso de um novo profissional e defina o perfil dele no sistema.',
    });
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Bem-vindo(a) ao {brand.name}</h1>
        <p className="page__description">
          Você está acessando como {perfilLabel(perfil)}. Escolha o que deseja fazer.
        </p>
      </header>

      {actions.length === 0 ? (
        <Notice variant="info">
          Seu perfil ainda não tem ações disponíveis neste sistema. Procure o administrador da sua
          unidade.
        </Notice>
      ) : (
        <ul className="action-grid">
          {actions.map((action) => (
            <li key={action.path}>
              <a
                className="action-card"
                href={action.path}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                  event.preventDefault();
                  onNavigate(action.path);
                }}
              >
                <span className="action-card__icon">
                  <MaterialIcon name={action.icon} size={24} />
                </span>
                <span className="action-card__title">{action.title}</span>
                <span className="action-card__text">{action.text}</span>
                <span className="action-card__cta">
                  Abrir <MaterialIcon name="arrow_forward" size={16} />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;
