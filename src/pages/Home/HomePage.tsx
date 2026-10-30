import { Notice } from '../../components/ui/Notice';
import { brand } from '../../config/brand';
import { HomeActionCard } from './HomeActionCard';
import { useHomePage } from './hooks/useHomePage';
import '../../components/layout/layout.css';
import './HomePage.css';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const home = useHomePage(onNavigate);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Bem-vindo(a) ao {brand.name}</h1>
        <p className="page__description">Você está acessando como {home.perfilLabel}. Escolha o que deseja fazer.</p>
      </header>

      {home.actions.length === 0 ? (
        <Notice variant="info">Seu perfil ainda não tem ações disponíveis neste sistema. Procure o administrador da sua unidade.</Notice>
      ) : (
        <ul className="action-grid">
          {home.actions.map((action) => (
            <HomeActionCard key={action.path} action={action} onClick={(event) => home.handleActionClick(event, action.path)} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default HomePage;
