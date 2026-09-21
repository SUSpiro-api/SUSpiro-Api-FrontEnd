import { canCreatePatient, isAdmin } from '../../features/auth/authorization';
import { logout } from '../../features/auth/service';
import { getCurrentUser } from '../../features/auth/token';
import './HomePage.css';

interface HomePageProps {
  onLogout: () => void;
  onCadastrarFuncionario: () => void;
  onCadastrarCidadao: () => void;
}

export function HomePage({
  onLogout,
  onCadastrarFuncionario,
  onCadastrarCidadao,
}: HomePageProps) {
  const user = getCurrentUser();
  const perfil = user?.perfil;

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <main className="home-page">
      <section className="home-page__card" aria-labelledby="home-title">
        <p className="home-page__eyebrow">SUSpiro</p>
        <h1 id="home-title">Bem-vindo(a) ao SUSpiro</h1>
        {user && <p>CPF autenticado: {user.sub}</p>}
        {perfil && <p>Perfil: {perfil}</p>}

        <div className="home-page__actions">
          {canCreatePatient(perfil) && (
            <button type="button" onClick={onCadastrarCidadao}>
              Cadastrar cidadão
            </button>
          )}

          {isAdmin(perfil) && (
            <button type="button" onClick={onCadastrarFuncionario}>
              Cadastrar funcionário
            </button>
          )}

          <button type="button" className="home-page__secondary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
