import { useState } from 'react';
import { BrandPanel } from '../../../components/Login/BrandPanel';
import { PasswordField } from '../../../components/ui/PasswordField';
import { Button } from '../../../components/ui/Button';
import { ApiError, authenticatedFetch } from '../../../api/httpClient';
import { setSenhaProvisoria } from '../token';
import '../../../components/Login/Login.css';

interface TrocaSenhaPageProps {
  onConcluido: () => void;
  onSair: () => void;
}

/** Primeiro acesso ou senha redefinida: a API só libera o sistema após a troca. */
export function TrocaSenhaPage({ onConcluido, onSair }: TrocaSenhaPageProps) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!senhaAtual) return setErro('Informe a senha provisória recebida por e-mail.');
    if (novaSenha.length < 8) return setErro('A nova senha deve ter pelo menos 8 caracteres.');
    if (novaSenha !== confirmacao) return setErro('As senhas não coincidem.');

    setErro('');
    setIsSubmitting(true);
    try {
      await authenticatedFetch<void>('/usuarios/me/senha', {
        method: 'PATCH',
        body: JSON.stringify({ senhaAtual, novaSenha }),
      });
      setSenhaProvisoria(false);
      onConcluido();
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : 'Não foi possível trocar a senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page" aria-label="Troca de senha do SUSpiro">
      <section className="login-container" aria-label="Troca de senha">
        <BrandPanel />
        <section className="login-form-panel" aria-label="Formulário de troca de senha">
          <article className="login-login-form" aria-labelledby="troca-senha-title">
            <header>
              <h1 id="troca-senha-title" className="login-login-form__title">
                Cadastre sua nova senha
              </h1>
              <p className="login-login-form__subtitle">
                Você entrou com uma senha provisória. Defina uma senha pessoal para liberar o
                acesso ao sistema.
              </p>
            </header>

            <form onSubmit={handleSubmit} noValidate aria-label="Formulário de troca de senha">
              <PasswordField
                label="Senha provisória"
                autoComplete="current-password"
                value={senhaAtual}
                onChange={(event) => setSenhaAtual(event.target.value)}
              />
              <PasswordField
                label="Nova senha"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                value={novaSenha}
                onChange={(event) => setNovaSenha(event.target.value)}
              />
              <PasswordField
                label="Confirmar nova senha"
                autoComplete="new-password"
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
              />

              {erro && (
                <p className="login-form-error" role="alert">
                  {erro}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="login-login-form__submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
              </Button>

              <button
                type="button"
                className="login-link login-link--button login-link--back"
                onClick={onSair}
                disabled={isSubmitting}
              >
                Sair
              </button>
            </form>
          </article>
        </section>
      </section>
    </main>
  );
}
