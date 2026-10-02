# Segurança do frontend SUSpiro

## Objetivo

O frontend não persiste JWT em `localStorage`, `sessionStorage`, IndexedDB ou cookies criados por JavaScript. O modo recomendado para produção é `VITE_AUTH_MODE=cookie`.

## Autenticação de produção

O backend integrado emite uma sessão por cookie. Em produção, configure `AUTH_COOKIE_SECURE=true`; no desenvolvimento local com HTTP, mantenha `false`. O cookie usa, no mínimo:

- `HttpOnly`
- `Secure`
- `SameSite=Lax` ou `SameSite=Strict` quando o cenário permitir
- escopo de `Domain` e `Path` mínimo necessário
- expiração/rotação de sessão controladas pelo servidor

O frontend envia `credentials: include` e nunca precisa conhecer o JWT. O backend valida o JWT apenas no servidor.

A sessão autenticada é restaurada por `GET /auth/me` por padrão. O logout é `POST /auth/logout`. Essas rotas são configuráveis por `.env`.

## CSRF

Em autenticação por cookie, o backend integrado fornece um token CSRF não-HttpOnly no cookie `XSRF-TOKEN` e valida o header `X-CSRF-TOKEN` em operações mutáveis. O frontend lê apenas esse cookie de CSRF e participa do protocolo enviando o header.

## Autorização

Os perfis exibidos pelo frontend são somente UX. A autorização real deve ser validada pelo backend em cada endpoint. Nunca confiar em `perfil` ou rota escondida como mecanismo de segurança.

## Dados locais

O recurso de lembrar CPF utiliza `sessionStorage` apenas para conveniência durante a sessão do navegador. Nenhum token, senha ou segredo é armazenado no storage do navegador.

A persistência local das guias (`VITE_GUIDE_DATA_SOURCE=local`) é exclusiva para protótipo/teste. Em produção, usar `VITE_GUIDE_DATA_SOURCE=api` para que dados clínicos não sejam mantidos no navegador.

## XSS

O projeto evita APIs perigosas como `dangerouslySetInnerHTML`, `innerHTML`, `eval` e `new Function`. Dados vindos da API devem continuar sendo renderizados como texto/props React, sem injeção manual de HTML.

## Cache

O cache em memória da camada HTTP não armazena respostas autenticadas por cookie, porque o JavaScript não possui uma chave de sessão confiável para particionar usuários. Isso evita vazamento entre sessões no cache do cliente.

## CSP e headers

Em produção, configure headers no servidor/CDN/reverse proxy, preferencialmente:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `frame-ancestors 'none'` via CSP

Esses headers não podem ser garantidos apenas pelo bundle React; o servidor que entrega o frontend precisa aplicá-los.

## Modo temporário para o backend atual

Para compatibilidade com uma API legada que ainda retorne JWT no corpo de `/auth/login`, use:

```env
VITE_AUTH_MODE=legacy-bearer-memory
```

Nesse modo o JWT permanece somente em memória. Isso é uma ponte de desenvolvimento, não o modo recomendado para produção. Depois da implementação do backend de sessão por cookie, volte para:

```env
VITE_AUTH_MODE=cookie
```
