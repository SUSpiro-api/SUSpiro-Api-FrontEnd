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

export type Route =
  | '/'
  | '/login'
  | '/recuperar-senha'
  | '/cadastro-funcionario'
  | '/cadastro-cidadao'
  | '/dashboard';

export function resolveRoute(pathname: string): Route {
  if (pathname === '/recuperar-senha') return '/recuperar-senha';
  if (pathname === '/cadastro-funcionario') return '/cadastro-funcionario';
  if (pathname === '/cadastro-cidadao') return '/cadastro-cidadao';
  if (pathname === '/dashboard') return '/dashboard';
  if (pathname === '/login') return '/login';
  return '/';
}
