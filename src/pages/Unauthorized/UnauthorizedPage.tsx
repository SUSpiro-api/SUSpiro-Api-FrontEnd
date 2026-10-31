
import { MaterialIcon } from '../../components/icons';
import { Button } from '../../components/ui/Button';
import '../../components/layout/layout.css';

interface UnauthorizedPageProps {
  onBack: () => void;
}

export function UnauthorizedPage({ onBack }: UnauthorizedPageProps) {
  return (
    <div className="page">
      <div className="card empty-state">
        <span className="empty-state__icon" aria-hidden="true">
          <MaterialIcon name="lock" size={28} />
        </span>
        <h1 className="empty-state__title">Acesso não autorizado</h1>
        <p className="empty-state__text">
          Seu perfil não tem permissão para acessar esta página. Se você acredita que deveria ter,
          procure o administrador da sua unidade.
        </p>
        <Button onClick={onBack}>Voltar ao início</Button>
      </div>
    </div>
  );
}
