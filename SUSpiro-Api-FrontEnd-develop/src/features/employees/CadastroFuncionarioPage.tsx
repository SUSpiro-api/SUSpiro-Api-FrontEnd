import { useState } from 'react';
import { BrandPanel } from '../../components/Login/BrandPanel';
import { CadastroFuncionarioForm } from './CadastroFuncionarioForm';
import '../../components/Login/Login.css';

interface CadastroFuncionarioPageProps {
  podeCriarAdmin: boolean;
  onVoltar: () => void;
}

export function CadastroFuncionarioPage({ podeCriarAdmin, onVoltar }: CadastroFuncionarioPageProps) {
  const [sucesso, setSucesso] = useState(false);

  return (
    <main className="login-page" aria-label="Cadastro de funcionário do SUSpiro">
      <section className="login-container" aria-label="Cadastro de funcionário">
        <BrandPanel />
        <section className="login-form-panel" aria-label="Formulário de cadastro">
          {sucesso ? (
            <article className="login-login-form" aria-live="polite">
              <header>
                <h1 className="login-login-form__title">Funcionário cadastrado!</h1>
                <p className="login-login-form__subtitle">
                  O acesso foi criado com sucesso. Você pode cadastrar outro funcionário ou voltar.
                </p>
              </header>
              <button
                type="button"
                className="login-button login-button--primary login-login-form__submit"
                onClick={() => setSucesso(false)}
              >
                Cadastrar outro
              </button>
              <button type="button" className="login-link login-link--button login-link--back" onClick={onVoltar}>
                Voltar
              </button>
            </article>
          ) : (
            <CadastroFuncionarioForm
              podeCriarAdmin={podeCriarAdmin}
              onSucesso={() => setSucesso(true)}
              onCancelar={onVoltar}
            />
          )}
        </section>
      </section>
    </main>
  );
}
