import { describe, expect, it } from 'vitest';
import { canCreateAdmin, canCreatePatient, isAdmin } from './authorization';

describe('authorization policies', () => {
  it('allows admin actions only to admin profiles', () => {
    expect(isAdmin('ADMIN')).toBe(true);
    expect(isAdmin('SUPER_ADMIN')).toBe(true);
    expect(isAdmin('MEDICO')).toBe(false);
    expect(canCreateAdmin('SUPER_ADMIN')).toBe(true);
    expect(canCreateAdmin('ADMIN')).toBe(false);
  });

  it('allows patient registration for permitted profiles', () => {
    expect(canCreatePatient('RECEPCIONISTA')).toBe(true);
    expect(canCreatePatient('MEDICO')).toBe(true);
    expect(canCreatePatient('USUARIO')).toBe(false);
    expect(canCreatePatient(undefined)).toBe(false);
  });
});
