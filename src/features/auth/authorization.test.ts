import { describe, expect, it } from 'vitest';
import { canAccessProfessionalDashboard, canAccessSchedulingDashboard, canCreateAdmin, canCreatePatient, canScheduleGuides, canViewGuideQueue, isAdmin } from './authorization';

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

  it('lands reception, nursing and management on the scheduling dashboard', () => {
    expect(canAccessSchedulingDashboard('ENFERMEIRO')).toBe(true);
    expect(canAccessSchedulingDashboard('ATENDENTE')).toBe(true);
    expect(canAccessSchedulingDashboard('GERENTE')).toBe(true);
    expect(canAccessSchedulingDashboard('SUPER_ADMIN')).toBe(false);
    expect(canAccessSchedulingDashboard('MEDICO')).toBe(false);
    expect(canAccessSchedulingDashboard('PACIENTE')).toBe(false);
  });
});

describe('canViewGuideQueue', () => {
  it('opens the guide queue for physicians, reception, nursing and admins, but not patients', () => {
    expect(canViewGuideQueue('ATENDENTE')).toBe(true);
    expect(canViewGuideQueue('ENFERMEIRO')).toBe(true);
    expect(canViewGuideQueue('GERENTE')).toBe(true);
    expect(canViewGuideQueue('SUPER_ADMIN')).toBe(true);
    expect(canViewGuideQueue('MEDICO')).toBe(true);
    expect(canViewGuideQueue('PACIENTE')).toBe(false);
    expect(canViewGuideQueue(undefined)).toBe(false);
    expect(canScheduleGuides('MEDICO')).toBe(false);
    expect(canScheduleGuides('SUPER_ADMIN')).toBe(true);
    expect(canScheduleGuides('ATENDENTE')).toBe(true);
  });
});
