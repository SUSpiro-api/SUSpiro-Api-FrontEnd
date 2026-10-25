import { describe, expect, it } from 'vitest';
import { canAccessProfessionalDashboard, canAccessSchedulingDashboard, canCreateAdmin, canCreatePatient, canViewGuideQueue, isAdmin } from './authorization';

describe('authorization policies', () => {
  it('allows admin actions only to admin profiles', () => {
    expect(isAdmin('GERENTE')).toBe(true);
    expect(isAdmin('SUPER_ADMIN')).toBe(true);
    expect(isAdmin('MEDICO')).toBe(false);
    expect(canCreateAdmin('SUPER_ADMIN')).toBe(true);
    expect(canCreateAdmin('GERENTE')).toBe(false);
  });

  it('allows patient registration for permitted profiles', () => {
    expect(canCreatePatient('ATENDENTE')).toBe(true);
    expect(canCreatePatient('MEDICO')).toBe(true);
    expect(canCreatePatient('PACIENTE')).toBe(false);
    expect(canCreatePatient(undefined)).toBe(false);
  });
});

describe('canAccessProfessionalDashboard', () => {
  it('allows medical, nursing, reception and administrative profiles', () => {
    expect(canAccessProfessionalDashboard('MEDICO')).toBe(true);
    expect(canAccessProfessionalDashboard('GERENTE')).toBe(true);
    expect(canAccessProfessionalDashboard('SUPER_ADMIN')).toBe(true);
    expect(canAccessProfessionalDashboard('ENFERMEIRO')).toBe(true);
    expect(canAccessProfessionalDashboard('ATENDENTE')).toBe(true);
  });

  it('lands reception directly on scheduling; nursing uses the clinical dashboard', () => {
    expect(canAccessSchedulingDashboard('ENFERMEIRO')).toBe(false);
    expect(canAccessSchedulingDashboard('ATENDENTE')).toBe(true);
    expect(canAccessSchedulingDashboard('GERENTE')).toBe(false);
    expect(canAccessSchedulingDashboard('SUPER_ADMIN')).toBe(false);
    expect(canAccessSchedulingDashboard('MEDICO')).toBe(false);
    expect(canAccessSchedulingDashboard('PACIENTE')).toBe(false);
  });
});

describe('canViewGuideQueue', () => {
  it('opens the guide queue for reception and admins, but not clinicians or patients', () => {
    expect(canViewGuideQueue('ATENDENTE')).toBe(true);
    expect(canViewGuideQueue('ENFERMEIRO')).toBe(false);
    expect(canViewGuideQueue('GERENTE')).toBe(true);
    expect(canViewGuideQueue('SUPER_ADMIN')).toBe(true);
    expect(canViewGuideQueue('MEDICO')).toBe(false);
    expect(canViewGuideQueue('PACIENTE')).toBe(false);
    expect(canViewGuideQueue(undefined)).toBe(false);
  });
});
