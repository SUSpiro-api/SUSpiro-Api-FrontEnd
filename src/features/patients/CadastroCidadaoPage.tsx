// Monta a página de cadastro de cidadão.

import { MaterialIcon } from '../../components/icons';
import { ConfirmationPanel } from '../../components/ui/ConfirmationPanel';
import { CadastroCidadaoForm } from './CadastroCidadaoForm';
import { useCadastroCidadaoPage } from './hooks/useCadastroCidadaoPage';
import '../../components/layout/layout.css';

interface CadastroCidadaoPageProps {
  onVoltar: () => void;
}

export function CadastroCidadaoPage({ onVoltar }: CadastroCidadaoPageProps) {
  const cadastro = useCadastroCidadaoPage();

  return (
    <div className="page page--form">
      <header className="page__header">
        <h1 className="page__title">Cadastrar paciente</h1>
        {!cadastro.criado && <p className="page__description">O e-mail é obrigatório para recuperação de senha; convênio e telefone são opcionais.</p>}
      </header>

      <div className="form-page__grid">
        <div className="card form-page__main">
          {cadastro.criado ? (
            <ConfirmationPanel
              title="Paciente cadastrado com sucesso"
              description="Os dados foram registrados e a conta de acesso foi criada. No primeiro acesso, o paciente deve usar a data de nascimento no formato DDMMAAAA como senha inicial e trocá-la por uma senha forte. O e-mail cadastrado será usado para recuperação de acesso."
              details={[
                { label: 'Nome', value: cadastro.criado.nome },
                { label: 'CPF', value: cadastro.criado.cpfMascarado },
                { label: 'Convênio', value: cadastro.criado.convenio || 'Não informado' },
                { label: 'E-mail com acesso', value: cadastro.criado.email },
              ].filter((detail) => detail.value)}
              primaryAction={{ label: 'Cadastrar outro paciente', onClick: cadastro.cadastrarOutro }}
              secondaryAction={{ label: 'Voltar ao início', onClick: onVoltar }}
            />
          ) : (
            <CadastroCidadaoForm onSucesso={cadastro.setCriado} onCancelar={onVoltar} />
          )}
        </div>

        <aside className="form-page__aside" aria-label="Orientações do cadastro">
          <section className="form-aside">
            <h2 className="form-aside__title">
              <MaterialIcon name="info" size={18} aria-hidden="true" />
              O que você vai precisar
            </h2>
            <p className="form-aside__text">Confirme os dados com o paciente antes de começar:</p>
            <ul className="form-aside__list">
              <li><strong>CPF</strong> válido, com os 11 dígitos.</li>
              <li><strong>Data de nascimento</strong> completa.</li>
              <li><strong>Convênio</strong>, se o paciente possuir.</li>
              <li><strong>Telefone</strong> com DDD, se o paciente quiser informar.</li>
              <li><strong>E-mail válido</strong>, necessário para recuperar a senha por link.</li>
            </ul>
          </section>

          <section className="form-aside">
            <h2 className="form-aside__title">
              <MaterialIcon name="shield" size={18} aria-hidden="true" />
              Como estes dados são usados
            </h2>
            <p className="form-aside__text">
              O CPF é a chave de busca usada no atendimento: com o cadastro concluído, o médico abre o
              histórico do paciente e emite guias no próprio consultório, e a recepção agenda essas
              guias pelo nome ou CPF.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
