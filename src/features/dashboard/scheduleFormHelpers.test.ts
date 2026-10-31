import { describe, expect, it } from 'vitest';
import { isUuid } from './scheduleFormHelpers';

describe('identificador UUID do paciente', () => {
  it('aceita UUIDs no formato padrão retornado pela API', () => {
    expect(isUuid('08c1f5ab-1f4d-4c79-8bd8-a7a1c91d0df1')).toBe(true);
  });

  it('rejeita IDs numéricos de pacientes de demonstração', () => {
    expect(isUuid('1')).toBe(false);
    expect(isUuid(1)).toBe(false);
  });

  it('rejeita strings incompletas ou malformadas', () => {
    expect(isUuid('08c1f5ab-1f4d-4c79')).toBe(false);
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid(null)).toBe(false);
  });
});
