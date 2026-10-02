# Arquitetura do frontend SUSpiro

## Objetivo

O frontend foi organizado para manter a interface desacoplada das regras de negócio e da API. A integração com o backend Spring Boot acontece pelas interfaces e adapters da camada `infrastructure`.

## Estrutura

```text
src/
├── app/                    # Composição da aplicação e rotas
├── core/                   # Infraestrutura transversal (config + HTTP)
├── components/             # Componentes compartilhados de UI e sistema
├── features/               # Funcionalidades isoladas por domínio
│   ├── auth/
│   ├── dashboard/
│   ├── employees/
│   ├── guides/
│   └── patients/
├── pages/                  # Páginas simples/legadas que compõem features
├── shared/                 # Utilitários realmente compartilhados
├── styles/                 # Tokens, temas e estilos globais
└── utils/                  # Compatibilidade com utilitários existentes
```

## Como uma feature conversa com o backend

A regra é: componente React não conhece URL da API.

```text
Componente
   ↓
Hook / caso de uso
   ↓
Porta (interface)
   ↓
Adapter HTTP ou local
   ↓
core/api/httpClient
   ↓
Spring Boot
```

A feature `guides` já possui os dois adapters:

- `LocalGuideRepository`: usado apenas para protótipo/teste local.
- `HttpGuideRepository`: adapter da API real de guias persistida no PostgreSQL.

Para usar a API integrada:

```env
VITE_GUIDE_DATA_SOURCE=api
```

As URLs utilizadas pelo adapter ficam centralizadas em `src/features/guides/infrastructure/httpGuideRepository.ts`.

## Princípios aplicados

### Clean Code / SOLID

- **SoC/SRP:** componentes visuais, hooks, casos de uso e infraestrutura ficam separados.
- **DRY:** HTTP, datas, storage e catálogos têm uma única implementação reutilizável.
- **KISS/YAGNI:** não há camada adicional sem necessidade de uso real.
- **Composition over Inheritance:** composição de componentes React; herança apenas no `ErrorBoundary`, exigida pela API de classe do React.
- **Single Source of Truth:** tipos de guia no domínio; configuração HTTP em `core`; especialidades no catálogo da feature.
- **Dependency Inversion:** a aplicação de guias depende de `GuideRepository`, não do localStorage nem do fetch.
- **Repository/Adapter/Facade:** `GuideRepository`, adapters local/HTTP e facade `features/guides/index.ts`.

### React

- Componentização e componentes reutilizáveis.
- Hooks customizados para estado e lógica do formulário.
- Controlled components nos formulários.
- Estado colocalizado na feature que o utiliza.
- Code splitting/lazy loading das telas com `React.lazy` + `Suspense`.
- Error boundary para falhas inesperadas de renderização.

### TypeScript

- `strict`-like checks existentes mantidos pelo `tsconfig`.
- Uniões literais para tipos de domínio.
- Interfaces explícitas para contratos.
- Sem `any` no código criado nesta refatoração.

### API e dados

- API layer centralizada.
- `AbortSignal` suportado pelo `fetch` nativo via `RequestInit`.
- Retry automático apenas para requisições idempotentes e erros transitórios.
- Cache TTL opcional para GETs.
- Estados de loading, erro e vazio já presentes nas telas de dashboard.

### Qualidade

A configuração existente de Vitest e Oxlint foi mantida. A regra é testar primeiro as funções puras/casos de uso e depois os componentes críticos, sem colocar lógica de negócio diretamente no JSX.

## Segurança

- React já aplica escaping automático de texto renderizado.
- Tokens continuam seguindo o mecanismo existente do projeto para não alterar o contrato atual com o backend.
- CSP, proteção CSRF e headers de segurança são responsabilidade do servidor/reverse proxy quando a aplicação for publicada.
- Validação de input deve existir no frontend para UX e no backend para segurança.

## Integração com o Spring Boot

O backend já fornece os endpoints de guias e agendamento. A camada de infraestrutura concentra as URLs e permite trocar a fonte de dados sem alterar componentes da interface.
