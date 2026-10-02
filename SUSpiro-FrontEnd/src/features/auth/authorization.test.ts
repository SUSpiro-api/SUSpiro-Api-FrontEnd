import { describe, expect, it } from 'vitest';
import { canAccessProfessionalDashboard, canAccessSchedulingDashboard, canCreateAdmin, canCreatePatient, isAdmin } from './authorization';

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


describe('canAccessProfessionalDashboard', () => {
  it('allows medical, nursing, reception and administrative profiles', () => {
    expect(canAccessProfessionalDashboard('MEDICO')).toBe(true);
    expect(canAccessProfessionalDashboard('ADMIN')).toBe(true);
    expect(canAccessProfessionalDashboard('SUPER_ADMIN')).toBe(true);
    expect(canAccessProfessionalDashboard('ENFERMEIRO')).toBe(true);
    expect(canAccessProfessionalDashboard('RECEPCIONISTA')).toBe(true);
  });

  it('restricts the scheduling queue to nursing, reception and admins', () => {
    expect(canAccessSchedulingDashboard('ENFERMEIRO')).toBe(true);
    expect(canAccessSchedulingDashboard('RECEPCIONISTA')).toBe(true);
    expect(canAccessSchedulingDashboard('ADMIN')).toBe(false);
    expect(canAccessSchedulingDashboard('SUPER_ADMIN')).toBe(false);
    expect(canAccessSchedulingDashboard('MEDICO')).toBe(false);
    expect(canAccessSchedulingDashboard('USUARIO')).toBe(false);
  });
});
