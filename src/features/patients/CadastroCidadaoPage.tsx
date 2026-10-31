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
        {!cadastro.criado && <p className="page__description">O e-mail é necessário para enviar a senha temporária de acesso; convênio e telefone são opcionais.</p>}
      </header>

      <div className="form-page__grid">
        <div className="card form-page__main">
          {cadastro.criado ? (
            <ConfirmationPanel
              title="Paciente cadastrado com sucesso"
              description="Os dados foram registrados e uma senha temporária foi enviada para o e-mail cadastrado. O paciente deverá entrar com CPF e senha temporária e criar uma senha pessoal antes de acessar o sistema. Se o e-mail não chegar, confira o endereço cadastrado e as configurações de envio de e-mail."
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
              <MaterialIcon name="info" size={18} />
              O que você vai precisar
            </h2>
            <p className="form-aside__text">Confirme os dados com o paciente antes de começar:</p>
            <ul className="form-aside__list">
              <li><strong>CPF</strong> válido, com os 11 dígitos.</li>
              <li><strong>Data de nascimento</strong> completa.</li>
              <li><strong>Convênio</strong>, se o paciente possuir.</li>
              <li><strong>Telefone</strong> com DDD, se o paciente quiser informar.</li>
              <li><strong>E-mail válido</strong>, necessário para receber a senha temporária de primeiro acesso.</li>
            </ul>
          </section>

        </aside>
      </div>
    </div>
  );
}
