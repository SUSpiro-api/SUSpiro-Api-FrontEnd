import { useState } from 'react';
import { ConfirmationPanel } from '../../components/ui/ConfirmationPanel';
import { perfilLabel } from '../auth/perfil';
import { maskCpf } from '../../utils/mask';
import { CadastroFuncionarioForm } from './CadastroFuncionarioForm';
import type { UsuarioCriado } from './service';
import '../../components/layout/layout.css';

interface CadastroFuncionarioPageProps {
  podeCriarAdmin: boolean;
  onVoltar: () => void;
}

export function CadastroFuncionarioPage({ podeCriarAdmin, onVoltar }: CadastroFuncionarioPageProps) {
  const [criado, setCriado] = useState<UsuarioCriado | null>(null);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Cadastrar funcionário</h1>
        {!criado && <p className="page__description">Crie o acesso de um novo profissional e defina o perfil dele no sistema.</p>}
      </header>

      <div className="card">
        {criado ? (
          <ConfirmationPanel
            title="Funcionário cadastrado com sucesso"
            description="O acesso foi criado. Repasse a senha provisória ao funcionário com segurança."
            details={[
              { label: 'Nome', value: criado.nome },
              { label: 'Perfil', value: perfilLabel(criado.perfil) },
              { label: 'CPF', value: maskCpf(criado.cpf) },
            ].filter((detail) => detail.value)}
            primaryAction={{ label: 'Cadastrar outro funcionário', onClick: () => setCriado(null) }}
            secondaryAction={{ label: 'Voltar ao início', onClick: onVoltar }}
          />
        ) : (
          <CadastroFuncionarioForm
            podeCriarAdmin={podeCriarAdmin}
            onSucesso={setCriado}
            onCancelar={onVoltar}
          />
        )}
      </div>
    </div>
  );
}
