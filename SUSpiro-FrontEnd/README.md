# SUSpiro Frontend

Frontend React + TypeScript do SUSpiro, organizado por features e preparado para integração com o backend Spring Boot sem acoplar regras de negócio aos componentes.

## Arquitetura

```text
src/
├── app/                  # composição, navegação e rotas
├── core/                 # HTTP, configuração e contratos transversais
├── components/           # componentes reutilizáveis de UI/layout
├── features/
│   ├── auth/             # sessão, autenticação e autorização
│   ├── dashboard/        # dashboards e componentes clínicos
│   ├── employees/        # funcionários
│   ├── guides/           # domínio de guias + adapters
│   └── patients/         # cidadãos/pacientes
├── pages/                # páginas de composição
├── shared/               # abstrações compartilhadas
├── styles/               # design tokens e tema
├── test/                 # configuração dos testes
└── utils/                # funções puras
```

Fluxo das features:

```text
UI → Hook/Componente de feature → Caso de uso → Interface/Repository → Adapter → core/api → Backend
```

Consulte [`ARCHITECTURE.md`](./ARCHITECTURE.md) para as decisões de Clean Code e [`SECURITY.md`](./SECURITY.md) para o modelo de segurança.

## Autenticação

O frontend é **cookie-first** para produção.

```env
VITE_AUTH_MODE=cookie
```

Nesse modo:

- o JWT não é armazenado em `localStorage` ou `sessionStorage`;
- o frontend não cria cookie de autenticação por JavaScript;
- as requisições usam `credentials: include`;
- a sessão é restaurada por `GET /auth/me`;
- logout usa `POST /auth/logout`;
- operações mutáveis enviam `X-CSRF-TOKEN` quando o cookie `XSRF-TOKEN` estiver disponível;
- `401 Unauthorized` no endpoint de sessão (`/auth/me`) encerra a sessão da aplicação; erros 401 de APIs de negócio são devolvidos à feature que fez a requisição.

O backend integrado deste projeto já implementa o cookie `HttpOnly`, a proteção CSRF e os endpoints de sessão. O contrato está documentado em [`docs/AUTH-BACKEND-CONTRACT.md`](./docs/AUTH-BACKEND-CONTRACT.md).

### Compatibilidade com Bearer legado

Para integrações antigas que ainda usem JWT no header, o modo legado continua disponível apenas para desenvolvimento:

```env
VITE_AUTH_MODE=legacy-bearer-memory
```

Nesse modo, o JWT fica **somente em memória** e desaparece ao recarregar a página. Não é o modo recomendado para produção.

## Variáveis de ambiente

Crie `.env` a partir de `.env.example` e não versione credenciais reais.

```env
VITE_API_URL=/api
VITE_AUTH_MODE=cookie
VITE_AUTH_SESSION_PATH=/auth/me
VITE_AUTH_LOGOUT_PATH=/auth/logout
VITE_CSRF_COOKIE_NAME=XSRF-TOKEN
VITE_GUIDE_DATA_SOURCE=api
```

Para produção, use:

```env
VITE_AUTH_MODE=cookie
VITE_GUIDE_DATA_SOURCE=api
```

`VITE_GUIDE_DATA_SOURCE=api` usa a API real de guias implementada neste backend. `local` continua disponível somente para protótipo/teste.

## Comandos

```bash
npm ci
npm run typecheck
npm run typecheck:tests
npm run test:run
npm run test:coverage
npm run lint
npm run build
```

Node recomendado: `>=20.19.0`.

## Rotas

| Rota | Acesso | Tela |
| --- | --- | --- |
| `/` | autenticado | Início | 
| `/login` | pública | Login por CPF |
| `/recuperar-senha` | pública | Recuperação de senha |
| `/cadastro-cidadao` | `SUPER_ADMIN`, `ADMIN`, `MEDICO`, `ENFERMEIRO`, `RECEPCIONISTA` | Cadastro de cidadão |
| `/cadastro-funcionario` | `ADMIN`, `SUPER_ADMIN` | Cadastro de funcionário |
| `/dashboard` | `MEDICO`, `ENFERMEIRO`, `RECEPCIONISTA`, `ADMIN`, `SUPER_ADMIN` | Dashboard profissional/fila |

O frontend controla a experiência e esconde rotas sem permissão, mas a autorização real deve ser feita pelo backend.

## Guias e agendamento

A feature `guides` está preparada para dois adapters:

- `LocalGuideRepository`: somente protótipo/teste;
- `HttpGuideRepository`: integração com a API real.

A UI já separa responsabilidades para médico e recepção/enfermagem. A persistência de produção está implementada no backend com PostgreSQL e Flyway.

## Segurança e produção

Consulte [`SECURITY.md`](./SECURITY.md). O projeto também evita `dangerouslySetInnerHTML`, `innerHTML`, `eval` e `new Function`, valida entradas no cliente, centraliza erros HTTP, cancela requisições, evita cache autenticado compartilhado no modo cookie e usa `sessionStorage` apenas para o CPF lembrado temporariamente.

CSP, HSTS e os demais security headers devem ser enviados pelo servidor/CDN/reverse proxy. O bundle React sozinho não consegue impor todos esses headers.

## Qualidade

A suíte cobre CPF, máscaras, validações, autorização, autenticação/sessão, cliente HTTP, componentes e regras da feature de guias. A organização favorece testes unitários e de integração por feature e deixa a UI desacoplada dos adapters de dados.
