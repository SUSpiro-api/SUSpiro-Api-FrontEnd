// Relaciona os caminhos do navegador com as telas do sistema.

import { lazy } from 'react';
import { ForgotPasswordFeature } from '../features/auth/password-recovery/ForgotPasswordFeature';
import { LoginFeature } from '../features/auth/sign-in/LoginFeature';
import { HomePage } from '../pages/Home/HomePage';

export const InitialHomePage = HomePage;
export const InitialLoginFeature = LoginFeature;
export const InitialForgotPasswordFeature = ForgotPasswordFeature;

export const LazyCadastroFuncionarioPage = lazy(async () => import('../features/employees/CadastroFuncionarioPage').then((module) => ({ default: module.CadastroFuncionarioPage })));
export const LazyCadastroCidadaoPage = lazy(async () => import('../features/patients/CadastroCidadaoPage').then((module) => ({ default: module.CadastroCidadaoPage })));
export const LazyDashboardPage = lazy(async () => import('../features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
export const LazyUnauthorizedPage = lazy(async () => import('../pages/Unauthorized/UnauthorizedPage').then((module) => ({ default: module.UnauthorizedPage })));
export const LazyPerfilPage = lazy(async () => import('../features/profile/PerfilPage').then((module) => ({ default: module.PerfilPage })));
export const LazyBuscarPacientePage = lazy(async () => import('../features/scheduling/BuscarPacientePage').then((module) => ({ default: module.BuscarPacientePage })));
export const LazyBuscarGuiaPage = lazy(async () => import('../features/scheduling/BuscarGuiaPage').then((module) => ({ default: module.BuscarGuiaPage })));
export const LazyMinhaSaudePage = lazy(async () => import('../features/patient-area/MinhaSaudePage').then((module) => ({ default: module.MinhaSaudePage })));
export const LazyOrientacoesPage = lazy(async () => import('../features/patient-area/OrientacoesPage').then((module) => ({ default: module.OrientacoesPage })));

export type Route =
  | '/'
  | '/login'
  | '/criar-conta'
  | '/recuperar-senha'
  | '/cadastro-funcionario'
  | '/cadastro-cidadao'
  | '/perfil'
  | '/minha-saude'
  | '/orientacoes'
  | '/proteger-conta'
  | '/dashboard'
  | '/dashboard/atendimento'
  | '/dashboard/agenda'
  | '/dashboard/pacientes-recentes'
  | '/dashboard/atividade-recente'
  | '/dashboard/acoes-rapidas'
  | '/dashboard/guias'
  | '/dashboard/buscar-paciente'
  | '/dashboard/buscar-guia';

export function resolveRoute(pathname: string): Route {
  if (pathname === '/criar-conta') return '/criar-conta';
  if (pathname === '/recuperar-senha') return '/recuperar-senha';
  if (pathname === '/cadastro-funcionario') return '/cadastro-funcionario';
  if (pathname === '/cadastro-cidadao') return '/cadastro-cidadao';
  if (pathname === '/perfil') return '/perfil';
  if (pathname === '/minha-saude') return '/minha-saude';
  if (pathname === '/orientacoes') return '/orientacoes';
  if (pathname === '/proteger-conta') return '/proteger-conta';
  if (pathname === '/dashboard') return '/dashboard';
  if (pathname === '/dashboard/atendimento') return '/dashboard/atendimento';
  if (pathname === '/dashboard/agenda') return '/dashboard/agenda';
  if (pathname === '/dashboard/pacientes-recentes') return '/dashboard/pacientes-recentes';
  if (pathname === '/dashboard/atividade-recente') return '/dashboard/atividade-recente';
  if (pathname === '/dashboard/acoes-rapidas') return '/dashboard/acoes-rapidas';
  if (pathname === '/dashboard/guias') return '/dashboard/guias';
  if (pathname === '/dashboard/buscar-paciente') return '/dashboard/buscar-paciente';
  if (pathname === '/dashboard/buscar-guia') return '/dashboard/buscar-guia';
  if (pathname === '/login') return '/login';
  return '/';
}
