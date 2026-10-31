// Modal obrigatório de primeiro acesso: não permite abrir o sistema sem trocar a senha inicial.

import type { PerfilUsuario } from '../types';
import { Button } from '../../../components/ui/Button';
import { PasswordField } from '../../../components/ui/PasswordField';
import { usePasswordChangeForm } from './hooks/usePasswordChangeForm';
import '../weak-password/weak-password-notice.css';

interface TrocaSenhaPageProps {
  perfil?: PerfilUsuario;
  onConcluido: () => void;
  onSair: () => void;
}

export function TrocaSenhaPage({ perfil, onConcluido, onSair }: TrocaSenhaPageProps) {
  const form = usePasswordChangeForm({ onConcluido, exigirSenhaAtual: perfil !== 'PACIENTE' });
  return (
    <main className="weak-password-page" aria-label="Proteção obrigatória da conta">
      <section
        className="weak-password-modal"
        aria-labelledby="troca-senha-title"
        aria-describedby="troca-senha-description"
      >
        <div className="weak-password-modal__panel">
          <h1 id="troca-senha-title" className="weak-password-modal__title">
            Crie sua nova senha pessoal
          </h1>
          <div id="troca-senha-description" className="weak-password-modal__text">
            <p>Para concluir o primeiro acesso, crie uma senha pessoal forte.</p>
            {perfil === 'PACIENTE' ? (
              <p>Você entrou com uma senha temporária enviada por e-mail. Não é necessário informá-la novamente.</p>
            ) : (
              <p>Use a senha inicial fornecida pela equipe e depois crie sua senha pessoal.</p>
            )}
            <p>Use de 12 a 72 caracteres, incluindo maiúsculas, minúsculas, número e símbolo. Evite reutilizar senhas de outros serviços.</p>
          </div>

          <form onSubmit={form.handleSubmit} noValidate aria-label="Troca obrigatória de senha">
            {perfil !== 'PACIENTE' && (
              <PasswordField
                label="Senha atual ou inicial"
                autoComplete="current-password"
                required
                data-autofocus
                value={form.senhaAtual}
                onChange={(event) => form.setSenhaAtual(event.target.value)}
              />
            )}
            <PasswordField
              label="Nova senha forte"
              hint="12 a 72 caracteres, com maiúscula, minúscula, número e símbolo."
              autoComplete="new-password"
              data-autofocus={perfil === 'PACIENTE' ? true : undefined}
              minLength={12}
              maxLength={72}
              required
              value={form.novaSenha}
              onChange={(event) => form.setNovaSenha(event.target.value)}
            />
            <PasswordField
              label="Confirmar nova senha"
              autoComplete="new-password"
              minLength={12}
              maxLength={72}
              required
              value={form.confirmacao}
              onChange={(event) => form.setConfirmacao(event.target.value)}
            />

            {form.erro && <p className="login-form-error" role="alert">{form.erro}</p>}

            <div className="weak-password-modal__actions">
              <Button type="submit" fullWidth disabled={form.isSubmitting} aria-busy={form.isSubmitting}>
                {form.isSubmitting ? 'Salvando senha...' : 'Salvar nova senha e continuar'}
              </Button>
              <Button type="button" variant="secondary" fullWidth onClick={onSair} disabled={form.isSubmitting}>
                Sair da conta
              </Button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
