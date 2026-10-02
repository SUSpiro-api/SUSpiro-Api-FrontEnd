import { useState } from 'react';
import { ConfirmationPanel } from '../../components/ui/ConfirmationPanel';
import { maskCns, maskCpf } from '../../utils/mask';
import { CadastroCidadaoForm } from './CadastroCidadaoForm';
import type { PacienteCriado } from './service';
import '../../components/layout/layout.css';

interface CadastroCidadaoPageProps {
  onVoltar: () => void;
}

export function CadastroCidadaoPage({ onVoltar }: CadastroCidadaoPageProps) {
  const [criado, setCriado] = useState<PacienteCriado | null>(null);

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Cadastrar cidadão</h1>
        {!criado && <p className="page__description">Todos os campos são obrigatórios, exceto o telefone.</p>}
      </header>

      <div className="card">
        {criado ? (
          <ConfirmationPanel
            title="Cidadão cadastrado com sucesso"
            description="Os dados foram registrados no sistema."
            details={[
              { label: 'Nome', value: criado.nome },
              { label: 'CPF', value: maskCpf(criado.cpf) },
              { label: 'CNS', value: maskCns(criado.numeroSus) },
            ].filter((detail) => detail.value)}
            primaryAction={{ label: 'Cadastrar outro cidadão', onClick: () => setCriado(null) }}
            secondaryAction={{ label: 'Voltar ao início', onClick: onVoltar }}
          />
        ) : (
          <CadastroCidadaoForm onSucesso={setCriado} onCancelar={onVoltar} />
        )}
      </div>
    </div>
  );
}
