import { describe, expect, it } from 'vitest';
import { canAccessProfessionalDashboard, canAccessSchedulingDashboard, canCreateAdmin, canCreatePatient, canViewGuideQueue, isAdmin } from './authorization';

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

  it('lands nursing and reception directly on the scheduling queue, not admins or doctors', () => {
    expect(canAccessSchedulingDashboard('ENFERMEIRO')).toBe(true);
    expect(canAccessSchedulingDashboard('RECEPCIONISTA')).toBe(true);
    expect(canAccessSchedulingDashboard('ADMIN')).toBe(false);
    expect(canAccessSchedulingDashboard('SUPER_ADMIN')).toBe(false);
    expect(canAccessSchedulingDashboard('MEDICO')).toBe(false);
    expect(canAccessSchedulingDashboard('USUARIO')).toBe(false);
  });
});

describe('canViewGuideQueue', () => {
  it('opens the guide queue for reception, nursing and admins', () => {
    expect(canViewGuideQueue('RECEPCIONISTA')).toBe(true);
    expect(canViewGuideQueue('ENFERMEIRO')).toBe(true);
    expect(canViewGuideQueue('ADMIN')).toBe(true);
    expect(canViewGuideQueue('SUPER_ADMIN')).toBe(true);
    expect(canViewGuideQueue('MEDICO')).toBe(false);
    expect(canViewGuideQueue('USUARIO')).toBe(false);
    expect(canViewGuideQueue(undefined)).toBe(false);
  });
});
