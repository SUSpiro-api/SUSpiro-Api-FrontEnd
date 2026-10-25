// Avisa o paciente, no primeiro acesso, que a senha inicial (data de nascimento) é fraca.
// É só um aviso: o paciente aperta OK e segue para a área dele. Trocar a senha é opcional.

import { MaterialIcon } from '../../../components/icons';
import { Button } from '../../../components/ui/Button';
import { useDialog } from '../../../hooks/useDialog';
import './weak-password-notice.css';

interface WeakPasswordNoticeModalProps {
  onContinue: () => void;
  onChangePassword: () => void;
}

export function WeakPasswordNoticeModal({ onContinue, onChangePassword }: WeakPasswordNoticeModalProps) {
  // Não fecha com Esc nem clicando fora: o paciente precisa ler e apertar um dos botões.
  const dialog = useDialog({
    isOpen: true,
    focusSelector: '[data-autofocus]',
    onClose: onContinue,
    canClose: false,
  });

  return (
    <main className="weak-password-page" aria-label="Aviso de segurança">
      <dialog
        ref={dialog.dialogRef}
        className="weak-password-modal"
        aria-labelledby="weak-password-title"
        aria-describedby="weak-password-description"
        onCancel={dialog.handleCancel}
        onClick={dialog.handleDialogClick}
      >
        <div className="weak-password-modal__panel">
          <span className="weak-password-modal__icon" aria-hidden="true">
            <MaterialIcon name="shield" size={28} />
          </span>

          <h2 id="weak-password-title" className="weak-password-modal__title">
            Atenção: proteja a sua conta
          </h2>

          <div id="weak-password-description" className="weak-password-modal__text">
            <p>
              Neste primeiro acesso, você entrou usando a sua data de nascimento como senha.
              Ela é uma senha fraca, porque outras pessoas podem descobri-la com facilidade.
            </p>
            <p>Recomendamos trocar por uma senha mais forte:</p>
            <ul>
              <li>Use pelo menos 8 caracteres, misturando letras e números.</li>
              <li>Não use datas, nomes ou números em sequência, como 12345678.</li>
              <li>Não conte a sua senha para ninguém.</li>
            </ul>
            <p>
              Trocar a senha é opcional. Você pode fazer isso agora ou depois, em “Meu perfil”.
              A escolha é sua.
            </p>
          </div>

          <div className="weak-password-modal__actions">
            <Button type="button" data-autofocus fullWidth onClick={onContinue}>
              OK, entendi
            </Button>
            <Button type="button" variant="secondary" fullWidth onClick={onChangePassword}>
              Quero trocar a minha senha agora
            </Button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
