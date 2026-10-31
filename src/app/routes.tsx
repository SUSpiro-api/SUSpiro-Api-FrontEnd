import { lazy } from 'react';
import { ForgotPasswordFeature } from '../features/auth/password-recovery/ForgotPasswordFeature';
import { LoginFeature } from '../features/auth/sign-in/LoginFeature';
import { HomePage } from '../pages/Home/HomePage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';
import { PublicHomePage } from '../pages/PublicHome/PublicHomePage';

export const InitialHomePage = HomePage;
export const InitialNotFoundPage = NotFoundPage;
export const InitialPublicHomePage = PublicHomePage;
export const InitialLoginFeature = LoginFeature;
export const InitialForgotPasswordFeature = ForgotPasswordFeature;

export const LazyCadastroFuncionarioPage = lazy(async () => import('../features/employees/CadastroFuncionarioPage').then((module) => ({ default: module.CadastroFuncionarioPage })));
export const LazyCadastroCidadaoPage = lazy(async () => import('../features/patients/CadastroCidadaoPage').then((module) => ({ default: module.CadastroCidadaoPage })));
export const LazyDashboardPage = lazy(async () => import('../features/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })));
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
  | '/dashboard/buscar-guia'
  | '/404';

const routeByPath: Readonly<Partial<Record<Route, Route>>> = {
  '/': '/',
  '/login': '/login',
  '/criar-conta': '/criar-conta',
  '/recuperar-senha': '/recuperar-senha',
  '/cadastro-funcionario': '/cadastro-funcionario',
  '/cadastro-cidadao': '/cadastro-cidadao',
  '/perfil': '/perfil',
  '/minha-saude': '/minha-saude',
  '/orientacoes': '/orientacoes',
  '/proteger-conta': '/proteger-conta',
  '/dashboard': '/dashboard',
  '/dashboard/atendimento': '/dashboard/atendimento',
  '/dashboard/agenda': '/dashboard/agenda',
  '/dashboard/pacientes-recentes': '/dashboard/pacientes-recentes',
  '/dashboard/atividade-recente': '/dashboard/atividade-recente',
  '/dashboard/acoes-rapidas': '/dashboard/acoes-rapidas',
  '/dashboard/guias': '/dashboard/guias',
  '/dashboard/buscar-paciente': '/dashboard/buscar-paciente',
  '/dashboard/buscar-guia': '/dashboard/buscar-guia',
  '/404': '/404',
};

/** Ignora barra final (`/login/`) para não tratar uma rota válida como inexistente. */
function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** Caminhos desconhecidos resolvem para a tela 404 em vez de cair silenciosamente na página inicial. */
export function resolveRoute(pathname: string): Route {
  return routeByPath[normalizePath(pathname) as Route] ?? '/404';
}
