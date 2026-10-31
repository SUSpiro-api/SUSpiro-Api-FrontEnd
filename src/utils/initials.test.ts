import { describe, expect, it } from 'vitest';
import { initialsFromName } from './initials';

describe('initialsFromName', () => {
  it('usa a primeira e a última palavra do nome', () => {
    expect(initialsFromName('Dra. Marina Duarte')).toBe('MD');
    expect(initialsFromName('João S. Prado')).toBe('JP');
  });

  it('usa duas letras quando o nome tem uma palavra só', () => {
    expect(initialsFromName('Raphael')).toBe('RA');
  });

  it('remove acentos das iniciais', () => {
    expect(initialsFromName('Édson Souza')).toBe('ES');
  });

  it('ignora espaços extras e devolve vazio sem nome', () => {
    expect(initialsFromName('  Ana   Costa  ')).toBe('AC');
    expect(initialsFromName('')).toBe('');
    expect(initialsFromName(null)).toBe('');
    expect(initialsFromName('   ')).toBe('');
  });
});
