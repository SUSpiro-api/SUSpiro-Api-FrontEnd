# SUSpiro Frontend

Frontend React + TypeScript responsável pela interface do SUSpiro e pelas integrações com a API.

## Arquitetura

A aplicação segue uma organização orientada a funcionalidades:

```text
src/
├── app/                  # composição da aplicação e navegação
├── api/                  # cliente HTTP e erros de transporte
├── components/           # componentes visuais reutilizáveis
│   ├── Login/            # componentes específicos da autenticação
│   └── ui/               # primitives reutilizáveis
├── features/             # regras e integrações por domínio
│   ├── auth/
│   ├── employees/
│   └── patients/
├── pages/                # composição das telas
├── styles/               # tokens e estilos globais
├── test/                 # setup dos testes
└── utils/                # funções puras reutilizáveis
```

A regra de negócio não depende de componentes visuais: validações, autorização, sessão e integração HTTP ficam nas respectivas features/API.

## Contrato atual de autenticação

O backend atual autentica exclusivamente por CPF. Portanto, a tela não apresenta mais a opção enganosa de login por e-mail.

O token é armazenado no navegador para manter compatibilidade com a arquitetura atual. Para produção, a recomendação é migrar a sessão para cookie `HttpOnly`, `Secure` e `SameSite` adequado ao cenário.

## Comandos

```bash
npm ci
npm run typecheck
npm run test:run
npm run test:coverage
npm run lint
npm run build
```

O projeto declara Node `>=20.19.0`.

## Variáveis de ambiente

Crie `.env` a partir de um arquivo de exemplo e nunca versione credenciais reais.

```env
VITE_API_URL=http://localhost:8080
```

Para desenvolvimento local, o projeto também possui um proxy Vite em `/api`. Assim, mesmo que o Vite escolha outra porta (por exemplo, `5174`), o navegador fala com o frontend e o Vite encaminha as chamadas para `http://localhost:8080`, evitando problemas de CORS. Se `VITE_API_URL` não existir, o cliente usa `/api` automaticamente.

## Testes

A suíte cobre utilitários de CPF, validações, políticas de autorização, sessão/JWT no frontend, cliente HTTP, login, cadastro de funcionário e validações de cidadão.

Há também testes unitários no backend para validação de CPF, serviços de usuários e cidadãos e emissão/validação de JWT.
