import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLoginForm } from './useLoginForm';

describe('useLoginForm remembers CPF', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('saves the CPF immediately when the user enables Remember CPF', () => {
    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setField('cpf', '529.982.247-25'));
    act(() => result.current.setField('rememberCpf', true));
    expect(localStorage.getItem('suspiro.ui.rememberedCpf')).toBe('529.982.247-25');
  });

  it('updates the saved CPF and removes it immediately when the user disables the option', () => {
    const { result } = renderHook(() => useLoginForm());
    act(() => result.current.setField('cpf', '529.982.247-25'));
    act(() => result.current.setField('rememberCpf', true));
    act(() => result.current.setField('cpf', '111.444.777-35'));
    expect(localStorage.getItem('suspiro.ui.rememberedCpf')).toBe('111.444.777-35');
    act(() => result.current.setField('rememberCpf', false));
    expect(localStorage.getItem('suspiro.ui.rememberedCpf')).toBeNull();
  });
});
