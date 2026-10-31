import { beforeEach, describe, expect, it } from 'vitest';
import { clearRememberedCpf, getRememberedCpf, saveRememberedCpf } from './storage';

describe('remembered CPF storage', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('saves and reads remembered CPF', () => {
    saveRememberedCpf('111.444.777-35');
    expect(getRememberedCpf()).toBe('111.444.777-35');
    expect(localStorage.getItem('suspiro.ui.rememberedCpf')).toBe('111.444.777-35');
  });

  it('clears remembered CPF', () => {
    saveRememberedCpf('111.444.777-35');
    clearRememberedCpf();
    expect(getRememberedCpf()).toBe('');
  });

  it('does not persist an empty CPF', () => {
    saveRememberedCpf('   ');
    expect(localStorage.getItem('suspiro.ui.rememberedCpf')).toBeNull();
  });
});
