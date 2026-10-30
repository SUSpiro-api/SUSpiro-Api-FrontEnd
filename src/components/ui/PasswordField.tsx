
import { usePasswordVisibility } from '../../hooks/usePasswordVisibility';
import { TextField, type TextFieldProps } from './TextField';
import { MaterialIcon } from '../icons';

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'startIcon' | 'endSlot'>;

export function PasswordField(props: PasswordFieldProps) {
  const { isVisible, toggleVisibility } = usePasswordVisibility();

  return (
    <TextField
      {...props}
      type={isVisible ? 'text' : 'password'}
      startIcon={<MaterialIcon name="lock" size={18} />}
      endSlot={
        <button
          type="button"
          className="ui-icon-button"
          onClick={toggleVisibility}
          aria-label={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={isVisible}
        >
          <MaterialIcon name={isVisible ? 'visibility_off' : 'visibility'} size={20} />
        </button>
      }
    />
  );
}
