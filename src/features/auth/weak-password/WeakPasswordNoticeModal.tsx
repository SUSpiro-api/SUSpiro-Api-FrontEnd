// Compatibilidade com sessões antigas que ainda retornam um aviso de senha provisória.

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
          <h2 id="weak-password-title" className="weak-password-modal__title">
            Atenção: proteja a sua conta
          </h2>

          <div id="weak-password-description" className="weak-password-modal__text">
            <p>
              Sua conta está sinalizada para revisar a senha provisória. Para proteger suas informações de saúde,
              use uma senha exclusiva que não contenha dados pessoais previsíveis.
            </p>
            <p>Recomendamos trocar por uma senha mais forte:</p>
            <ul>
              <li>Use pelo menos 8 caracteres, misturando letras e números.</li>
              <li>Não use datas, nomes ou números em sequência, como 12345678.</li>
              <li>Não conte a sua senha para ninguém.</li>
            </ul>
            <p>
              Recomendamos concluir a troca agora. Nunca compartilhe sua senha e não reutilize senhas de outros serviços.
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
