// A mesma tela trata o pedido de recuperação e a redefinição aberta pelo link enviado ao e-mail.

import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, publicFetch } from '../../api/httpClient';
import { PasswordField } from '../../components/ui/PasswordField';
import { Button } from '../../components/ui/Button';
import { useForgotPasswordPage } from './hooks/useForgotPasswordPage';
import type { AuthService } from '../../features/auth/types';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ForgotPasswordSuccess } from './ForgotPasswordSuccess';
import './ForgotPasswordPage.css';

interface ForgotPasswordPageProps {
  onBack: () => void;
  authService?: AuthService;
}

function validarSenhaForte(senha: string): string {
  if (senha.length < 12 || senha.length > 72) return 'A senha deve ter entre 12 e 72 caracteres.';
  if (!/[a-z]/.test(senha) || !/[A-Z]/.test(senha) || !/\d/.test(senha) || !/[^A-Za-z0-9]/.test(senha)) {
    return 'Use letras maiúsculas e minúsculas, número e símbolo.';
  }
  return '';
}

export function ForgotPasswordPage({ onBack, authService }: ForgotPasswordPageProps) {
  const { stage, handleSubmit } = useForgotPasswordPage({ authService });
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const tokenFromUrl = new URLSearchParams(window.location.search).get('token')?.trim() ?? '';
  const [resetToken] = useState(tokenFromUrl);

  // Keep the token in component memory only; remove it from address bar/history immediately.
  useEffect(() => {
    if (tokenFromUrl) window.history.replaceState(window.history.state, '', window.location.pathname);
  }, [tokenFromUrl]);

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validarSenhaForte(novaSenha);
    if (validationError) {
      setResetError(validationError);
      return;
    }
    if (novaSenha !== confirmacao) {
      setResetError('As senhas não coincidem.');
      return;
    }
    if (!resetToken) {
      setResetError('Este link não é válido. Solicite uma nova recuperação de senha.');
      return;
    }

    setResetError('');
    setIsResetting(true);
    try {
      await publicFetch<void>('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, novaSenha }),
        retries: 0,
      });
      setResetComplete(true);
    } catch (error) {
      setResetError(error instanceof ApiError
        ? error.message
        : 'Não foi possível redefinir a senha. Solicite um novo link.');
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="login-page login-page--recovery" aria-label="Recuperação de senha do SUSpiro">
      <section className="login-recovery-shell" aria-label="Tela de recuperação de senha">
        {resetToken && resetComplete ? (
          <ForgotPasswordSuccess onBack={onBack} mode="reset" />
        ) : resetToken ? (
          <article className="login-recovery" aria-labelledby="reset-password-title">
            <header>
              <h1 id="reset-password-title" className="login-login-form__title">Crie uma nova senha</h1>
              <p className="login-login-form__subtitle">Escolha uma senha forte para recuperar o acesso à sua conta SUSpiro. O link é válido por 30 minutos e só pode ser usado uma vez.</p>
            </header>
            <form onSubmit={handleResetSubmit} noValidate aria-label="Definir nova senha">
              <PasswordField
                label="Nova senha"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                hint="12 a 72 caracteres, com maiúscula, minúscula, número e símbolo."
                value={novaSenha}
                onChange={(event) => { setNovaSenha(event.target.value); setResetError(''); }}
              />
              <PasswordField
                label="Confirmar nova senha"
                autoComplete="new-password"
                minLength={12}
                maxLength={72}
                required
                value={confirmacao}
                onChange={(event) => { setConfirmacao(event.target.value); setResetError(''); }}
              />
              {resetError && <p className="login-form-error" role="alert">{resetError}</p>}
              <Button type="submit" fullWidth disabled={isResetting} aria-busy={isResetting}>
                {isResetting ? 'Salvando...' : 'Redefinir senha'}
              </Button>
              <button type="button" className="login-link login-link--button login-link--back" onClick={onBack} disabled={isResetting}>
                Voltar para o login
              </button>
            </form>
          </article>
        ) : stage === 'success' ? (
          <ForgotPasswordSuccess onBack={onBack} />
        ) : (
          <ForgotPasswordForm onBack={onBack} onSubmit={handleSubmit} />
        )}
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
