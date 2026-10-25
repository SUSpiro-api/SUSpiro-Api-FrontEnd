import { beforeEach, describe, expect, it } from 'vitest';
import { clearRememberedCpf, getRememberedCpf, saveRememberedCpf } from './storage';

describe('remembered CPF storage', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('saves and reads remembered CPF', () => {
    saveRememberedCpf('529.982.247-25');
    expect(getRememberedCpf()).toBe('529.982.247-25');
    expect(localStorage.getItem('suspiro.ui.rememberedCpf')).toBe('529.982.247-25');
  });

  it('clears remembered CPF', () => {
    saveRememberedCpf('529.982.247-25');
    clearRememberedCpf();
    expect(getRememberedCpf()).toBe('');
  });

  it('does not persist an empty CPF', () => {
    saveRememberedCpf('   ');
    expect(localStorage.getItem('suspiro.ui.rememberedCpf')).toBeNull();
  });
});
