import { getCurrentUser } from '../../features/auth/token';
import { logout } from '../../features/auth/service';

interface HomePageProps {
  onLogout: () => void;
  onCadastrarFuncionario: () => void;
}

export function HomePage({ onLogout, onCadastrarFuncionario }: HomePageProps) {
  const user = getCurrentUser();
  const isAdmin = user?.perfil === 'ADMIN' || user?.perfil === 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Bem-vindo(a) ao SUSpiro</h1>
      {user && <p>CPF autenticado: {user.sub}</p>}
      {user?.perfil && <p>Perfil: {user.perfil}</p>}

      {isAdmin && (
        <button onClick={onCadastrarFuncionario} style={{ marginRight: '0.5rem' }}>
          Cadastrar funcionário
        </button>
      )}

      <button onClick={handleLogout}>Sair</button>
    </main>
  );
}

export default HomePage;
