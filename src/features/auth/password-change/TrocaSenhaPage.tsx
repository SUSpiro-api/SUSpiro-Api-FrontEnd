// Modal obrigatório de primeiro acesso: não permite abrir o sistema sem trocar a senha inicial.

import { MaterialIcon } from '../../../components/icons';
import type { PerfilUsuario } from '../types';
import { Button } from '../../../components/ui/Button';
import { PasswordField } from '../../../components/ui/PasswordField';
import { useDialog } from '../../../hooks/useDialog';
import { usePasswordChangeForm } from './hooks/usePasswordChangeForm';
import '../weak-password/weak-password-notice.css';

interface TrocaSenhaPageProps {
  perfil?: PerfilUsuario;
  onConcluido: () => void;
  onSair: () => void;
}

export function TrocaSenhaPage({ perfil, onConcluido, onSair }: TrocaSenhaPageProps) {
  const form = usePasswordChangeForm({ onConcluido });
  const dialog = useDialog({
    isOpen: true,
    focusSelector: '[data-autofocus]',
    onClose: onSair,
    canClose: false,
  });

  return (
    <main className="weak-password-page" aria-label="Proteção obrigatória da conta">
      <dialog
        ref={dialog.dialogRef}
        className="weak-password-modal"
        aria-labelledby="troca-senha-title"
        aria-describedby="troca-senha-description"
        onCancel={dialog.handleCancel}
        onClick={dialog.handleDialogClick}
      >
        <div className="weak-password-modal__panel">
          <span className="weak-password-modal__icon" aria-hidden="true">
            <MaterialIcon name="shield" size={28} />
          </span>

          <h1 id="troca-senha-title" className="weak-password-modal__title">
            Proteja sua conta com uma nova senha
          </h1>
          <div id="troca-senha-description" className="weak-password-modal__text">
            <p>Para sua segurança, o primeiro acesso só será liberado depois que você criar uma senha pessoal forte.</p>
            {perfil === 'PACIENTE' ? (
              <p>Para novos cadastros, a senha inicial é a data de nascimento no formato <strong>DDMMAAAA</strong>, com oito dígitos e sem barras. Exemplo de formato: 20051990. Se sua conta foi criada antes desta mudança, use a senha provisória que recebeu anteriormente.</p>
            ) : (
              <p>Informe a senha temporária definida pela administração no momento do cadastro.</p>
            )}
            <p>Use pelo menos 12 caracteres, incluindo letras maiúsculas e minúsculas, números e símbolos. Não reutilize senhas de outros serviços.</p>
          </div>

          <form onSubmit={form.handleSubmit} noValidate aria-label="Troca obrigatória de senha">
            <PasswordField
              label="Senha atual ou inicial"
              autoComplete="current-password"
              required
              data-autofocus
              value={form.senhaAtual}
              onChange={(event) => form.setSenhaAtual(event.target.value)}
            />
            <PasswordField
              label="Nova senha forte"
              hint="12 a 72 caracteres, com maiúscula, minúscula, número e símbolo."
              autoComplete="new-password"
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
      </dialog>
    </main>
  );
}
