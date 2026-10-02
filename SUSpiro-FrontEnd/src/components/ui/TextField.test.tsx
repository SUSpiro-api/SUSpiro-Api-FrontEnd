import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PasswordField } from './PasswordField';
import { TextField } from './TextField';
import { Toggle } from './Toggle';

describe('TextField', () => {
  it('links the label, hint and error to the input for assistive technology', () => {
    render(<TextField label="CPF" hint="Somente números." error="Informe um CPF válido." />);

    const input = screen.getByLabelText('CPF');
    const describedBy = input.getAttribute('aria-describedby') ?? '';

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(describedBy.split(' ')).toHaveLength(2);
    expect(document.getElementById(describedBy.split(' ')[0])).toHaveTextContent('Somente números.');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um CPF válido.');
  });

  it('is valid and has no description when there is no hint or error', () => {
    render(<TextField label="Nome completo" />);

    const input = screen.getByLabelText('Nome completo');

    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps an aria-describedby passed by the caller', () => {
    render(<TextField label="CPF" hint="Dica" aria-describedby="externo" />);

    expect(screen.getByLabelText('CPF').getAttribute('aria-describedby')).toContain('externo');
  });
});

describe('PasswordField', () => {
  it('hides the password by default and lets the user show and hide it', () => {
    render(<PasswordField label="Senha" />);

    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('type', 'password');

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('does not block pasting', () => {
    render(<PasswordField label="Senha" />);

    const input = screen.getByLabelText('Senha');
    const event = new Event('paste', { bubbles: true, cancelable: true });
    input.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});

describe('Toggle', () => {
  it('exposes a switch with its state and reports changes', () => {
    const onChange = vi.fn();
    render(<Toggle label="Lembrar CPF" checked={false} onChange={onChange} />);

    const toggle = screen.getByRole('switch', { name: 'Lembrar CPF' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
