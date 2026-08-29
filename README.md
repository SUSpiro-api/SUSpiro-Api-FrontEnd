# SUSpiro Frontend

Este projeto é a parte visual do sistema SUSpiro. Ele é responsável por mostrar a interface do usuário, validar dados do formulário e se comunicar com a API do backend.

Em termos simples: aqui fica tudo que o usuário vê e interage no navegador.

## O que este projeto faz

Atualmente, o frontend já cobre alguns fluxos importantes:

- tela de login
- recuperação de senha
- validação de CPF e campos do formulário
- integração com o backend para autenticação
- testes para garantir que as regras funcionem corretamente

## Tecnologias usadas

- React
- TypeScript
- Vite
- Vitest
- Testing Library
- Oxlint

## Estrutura do projeto

A organização do código foi pensada para facilitar a manutenção:

```text
src/
├── app/
│   ├── App.tsx              # ponto principal da aplicação
│   ├── navigation.ts        # navegação simples com o histórico do navegador
│   └── routes/              # páginas/fluxos organizados por rota
│
├── components/
│   ├── Login/               # componentes da tela de login
│   ├── form/                # formulários reutilizáveis
│   ├── ui/                  # botões, inputs e elementos visuais
│   └── index.ts             # exportações centralizadas
│
├── features/
│   └── auth/
│       ├── sign-in/         # fluxo de login
│       ├── password-recovery/ # fluxo de recuperação de senha
│       ├── service.ts       # chamadas à API
│       ├── storage.ts       # armazenamento local do usuário/lembrar senha
│       ├── types.ts         # tipos usados pela autenticação
│       ├── validation.ts    # regras de validação
│       └── tests...         # testes da feature
│
├── pages/
│   ├── Login/               # página de login
│   ├── ForgotPassword/      # página de recuperação de senha
│   └── index.ts             # exportações das páginas
│
├── hooks/
│   ├── useLoginForm.ts      # lógica do formulário de login
│   └── index.ts             # exportações dos hooks
│
├── styles/
│   ├── global.css
│   └── tokens.css
│
├── test/
│   └── setup.ts             # configuração dos testes
│
├── utils/
│   ├── cpf.ts               # funções para validar/formatar CPF
│   └── cpf.test.ts          # testes do CPF
│
├── main.tsx                 # inicia a aplicação
└── index.html               # arquivo HTML inicial
```

## Explicando melhor as pastas

### app
Aqui fica a parte principal da aplicação. É o lugar onde a app é montada e onde as rotas são chamadas.

### components
São partes visuais reutilizáveis, como botões, campos de entrada e blocos de interface.

### features
Aqui ficam as regras de negócio e integrações específicas do sistema, como autenticação.

### pages
São as telas do sistema, ou seja, cada página que o usuário acessa.

### hooks
São funções personalizadas que ajudam a reutilizar lógica em diferentes componentes.

### utils
Aqui ficam funções auxiliares, como validação de CPF.

## Como rodar o projeto

Primeiro, instale as dependências:

```bash
npm install
```

Depois, rode a aplicação em modo de desenvolvimento:

```bash
npm run dev
```

A aplicação normalmente abre em uma porta local do Vite, como `http://localhost:5173`.

## Variáveis de ambiente

Se o backend estiver rodando localmente, pode ser necessário configurar a URL da API em um arquivo `.env`.

Exemplo:

```env
VITE_API_URL=http://localhost:8080/api
```

Se você não tiver esse arquivo ainda, pode criar um novo na raiz do projeto.

## Scripts disponíveis

### Iniciar app em desenvolvimento
```bash
npm run dev
```

### Rodar testes
```bash
npm test
```

### Rodar testes uma vez
```bash
npm run test:run
```

### Ver cobertura dos testes
```bash
npm run test:coverage
```

### Verificar tipos do TypeScript
```bash
npm run typecheck
```

### Fazer build da aplicação
```bash
npm run build
```

### Rodar lint
```bash
npm run lint
```

## Como funciona a autenticação

A autenticação foi organizada em camadas:

1. o formulário captura os dados digitados
2. a validação verifica se o CPF/e-mail e senha estão corretos
3. a feature de autenticação chama a API
4. o resultado é exibido para o usuário

Isso ajuda a manter o código organizado e mais fácil de testar.

## Regras importantes do projeto

- os componentes não devem ficar com toda a regra de negócio
- validações ficam separadas para facilitar manutenção
- a interface usa feedback visual para erros e sucesso
- a segurança é levada em conta, evitando salvar senha no navegador
- os testes ajudam a garantir que o sistema continue funcionando

## Testes que já existem

Os testes cobrem:

- validação de CPF
- cálculo dos dígitos do CPF
- rejeição de CPFs inválidos
- validação de login
- validação de senha
- recuperação de senha
- comportamento de erro e sucesso

## Próximos passos sugeridos

1. conectar com o backend real
2. criar a página principal do sistema após o login
3. adicionar telas de paciente, agenda e atendimento
4. melhorar a autenticação com tokens e sessão segura
5. criar mais testes de integração e fluxo completo

## Dica para iniciantes

Se você está começando agora, foque primeiro em entender estas partes:

- [src/app/App.tsx](src/app/App.tsx)
- [src/features/auth/validation.ts](src/features/auth/validation.ts)
- [src/features/auth/service.ts](src/features/auth/service.ts)
- [src/pages/Login/LoginPage.tsx](src/pages/Login/LoginPage.tsx)
- [src/hooks/useLoginForm.ts](src/hooks/useLoginForm.ts)

Esses arquivos mostram bem como o projeto está organizado.

## Conclusão

Este projeto é um frontend React com estrutura organizada para crescer com o tempo. Ele já tem autenticação, validação e testes básicos, e está pronto para evoluir para mais telas e integrações.

Se você estiver começando a colaborar agora, a melhor forma é entender primeiro a tela de login e depois seguir para a autenticação e validações.
