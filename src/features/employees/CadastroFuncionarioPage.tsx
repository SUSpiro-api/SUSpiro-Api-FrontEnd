import { MaterialIcon } from '../../components/icons';
import { ConfirmationPanel } from '../../components/ui/ConfirmationPanel';
import { perfilLabel } from '../auth/perfil';
import { maskCpf } from '../../utils/mask';
import { CadastroFuncionarioForm } from './CadastroFuncionarioForm';
import { useCadastroFuncionarioPage } from './hooks/useCadastroFuncionarioPage';
import '../../components/layout/layout.css';

interface CadastroFuncionarioPageProps {
  podeCriarAdmin: boolean;
  onVoltar: () => void;
}

export function CadastroFuncionarioPage({ podeCriarAdmin, onVoltar }: CadastroFuncionarioPageProps) {
  const cadastro = useCadastroFuncionarioPage();

  return (
    <div className="page page--form">
      <header className="page__header">
        <h1 className="page__title">Cadastrar funcionário</h1>
        {!cadastro.criado && <p className="page__description">Crie o acesso de um novo profissional e defina o perfil dele no sistema.</p>}
      </header>

      <div className="form-page__grid">
        <div className="card form-page__main">
          {cadastro.criado ? (
            <ConfirmationPanel
              title="Funcionário cadastrado com sucesso"
              description="O acesso foi criado com a senha temporária definida no formulário. O funcionário deverá substituí-la por uma senha forte no primeiro acesso. Por segurança, a senha não será exibida novamente."
              details={[
                { label: 'Nome', value: cadastro.criado.nome },
                { label: 'Perfil', value: perfilLabel(cadastro.criado.perfil) },
                { label: 'CPF', value: maskCpf(cadastro.criado.cpf) },
                { label: 'E-mail', value: cadastro.criado.email },
              ].filter((detail) => detail.value)}
              primaryAction={{ label: 'Cadastrar outro funcionário', onClick: cadastro.cadastrarOutro }}
              secondaryAction={{ label: 'Voltar ao início', onClick: onVoltar }}
            />
          ) : (
            <CadastroFuncionarioForm
              podeCriarAdmin={podeCriarAdmin}
              onSucesso={cadastro.setCriado}
              onCancelar={onVoltar}
            />
          )}
        </div>

        <aside className="form-page__aside" aria-label="Orientações do cadastro">
          <section className="form-aside">
            <h2 className="form-aside__title">
              <MaterialIcon name="info" size={18} />
              O que você vai precisar
            </h2>
            <p className="form-aside__text">Tenha em mãos antes de começar:</p>
            <ul className="form-aside__list">
              <li><strong>Nome completo</strong> do profissional.</li>
              <li><strong>CPF</strong> válido, que será usado para entrar no sistema.</li>
              <li><strong>Perfil de acesso</strong> adequado à função.</li>
              <li><strong>E-mail profissional</strong> válido para recuperação de acesso por link.</li>
              <li><strong>Senha temporária</strong> que deverá ser entregue ao profissional por um canal seguro.</li>
            </ul>
          </section>

          <section className="form-aside">
            <h2 className="form-aside__title">
              <MaterialIcon name="group" size={18} />
              Como cada perfil usa o sistema
            </h2>
            <ul className="form-aside__list">
              <li>Quem atende no consultório localiza pacientes pelo CPF e emite guias de consulta, retorno, exame e encaminhamento.</li>
              <li>Recepção agenda as guias emitidas pelos médicos e enfermeiros.</li>
              <li>Administradores cadastram funcionários e acompanham toda a operação da unidade.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
