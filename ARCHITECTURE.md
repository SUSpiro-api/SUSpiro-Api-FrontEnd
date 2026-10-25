# Como o frontend SUSpiro está organizado

A ideia desta estrutura é simples: deixar cada parte do sistema num lugar fácil de encontrar.

## Pastas principais

```text
src/
├── app/                 # Entrada, rotas e estado geral da sessão
├── api/                 # Comunicação HTTP com o backend
├── components/          # Componentes visuais reutilizados
│   ├── layout/          # AppShell, Navbar, menu lateral e barra superior
│   └── ui/              # Botões, campos, avisos e elementos básicos
├── config/              # Configurações do frontend, incluindo as variáveis de ambiente
├── hooks/               # Hooks compartilhados por mais de uma tela
├── features/
│   ├── auth/            # Login, sessão, permissões e senhas
│   ├── dashboard/       # Atendimento médico e fila de agendamentos
│   ├── employees/       # Cadastro de funcionários e seu hook de formulário
│   ├── guides/          # Criação e agendamento de guias
│   └── patients/        # Cadastro de cidadãos
├── pages/               # Telas gerais que ainda são usadas pelas funcionalidades
├── styles/              # Estilos globais e temas
├── test/                # Configuração comum dos testes
└── utils/               # Funções pequenas reutilizadas, como CPF, datas e armazenamento
```

## Onde mexer

- **A interface de uma tela:** procure na pasta da funcionalidade em `features/`.
- **Um componente visual reutilizável:** crie um arquivo próprio em `components/` ou na pasta de componentes da funcionalidade.
- **Estado, validação e ações de uma tela:** use um hook em `features/nome-da-funcionalidade/hooks/` quando isso deixar a tela mais fácil de ler.
- **Um comportamento usado em várias telas:** coloque o hook em `src/hooks/`, como `useDialog` e `useArrowKeyTabs`.
- **O menu principal:** `components/layout/Navbar.tsx` mostra os links e `useAppShell.ts` cuida do menu móvel, do foco e da navegação.
- **Uma chamada ao backend:** use o cliente de `api/httpClient.ts` e mantenha a chamada perto da funcionalidade que a utiliza.
- **Uma regra ou validação:** coloque-a na própria funcionalidade ou em `utils/` se for usada em várias partes.
- **Uma variável do `.env`:** leia-a em `config/env.ts`.

## Exemplo: criar uma guia

O fluxo fica dividido em etapas curtas:

```text
ScheduleModal (campos e botões)
    ↓
useScheduleForm (estado, validação e envio)
    ↓
features/guides (operação de criar guia)
    ↓
api/httpClient.ts (requisição HTTP)
    ↓
Backend Spring Boot
```

O dashboard não precisa montar a requisição HTTP por conta própria. Cada arquivo faz uma parte do trabalho.

## `.env`, `.env.example` e `env.ts`

- `.env` guarda os valores usados na sua máquina e não deve ser enviado ao Git.
- `.env.example` é um modelo que pode ser compartilhado com a equipe.
- `src/config/env.ts` é código TypeScript que lê as variáveis públicas do Vite e define valores padrão.

Variáveis iniciadas com `VITE_` ficam disponíveis no navegador. **Não coloque senhas nem chaves privadas nelas.**

## Antes de finalizar uma mudança

Execute estes comandos na pasta do frontend:

```bash
npm run typecheck
npm run test:run
npm run lint
npm run build
```

Mantenha os nomes simples, reutilize funções já existentes e evite criar novas camadas quando uma função direta resolver o problema.

## Hooks personalizados

Os hooks guardam a lógica de uma tela para que o componente possa se concentrar na interface.

- `src/app/useAppController.ts`: junta a navegação e a sessão.
- `src/app/useAppNavigation.ts`: cuida da rota atual e das trocas de página.
- `src/app/useAuthSession.ts`: restaura a sessão e cuida do login/logout.
- `src/app/usePageTitle.ts`: atualiza o título da aba do navegador.
- `src/components/layout/hooks/useAppShell.ts`: cuida do menu móvel, dos atalhos e do foco.
- `src/hooks/useDialog.ts`: abre e fecha janelas e cuida do foco.
- `src/hooks/useArrowKeyTabs.ts`: permite trocar de aba pelo teclado.
- `src/hooks/usePasswordVisibility.ts`: controla quando a senha aparece no campo.
- `src/features/auth/useLoginController.ts`: valida e envia o login.
- `src/features/auth/password-change/hooks/usePasswordChangeForm.ts`: valida e envia a nova senha.
- `src/pages/ForgotPassword/hooks/useForgotPasswordForm.ts`: controla o CPF e o pedido de recuperação.
- `src/features/patients/hooks/useCadastroCidadaoForm.ts`: controla o cadastro de cidadão.
- `src/features/employees/hooks/useCadastroFuncionarioForm.ts`: controla o cadastro de funcionário.
- `src/features/dashboard/hooks/useDoctorDashboard.ts`: cuida das ações do dashboard médico.
- `src/features/dashboard/hooks/useGuideQueue.ts`: carrega e filtra a fila de guias.
- `src/features/dashboard/hooks/usePatientSearch.ts`: controla a busca de paciente.
- `src/features/dashboard/hooks/useScheduleForm.ts`: controla os dados e o envio de uma nova guia.
- `src/features/dashboard/hooks/useSchedulePatient.ts`: cuida da troca do paciente no formulário.
- `src/features/dashboard/hooks/useGuideScheduleForm.ts`: controla o agendamento de uma guia.
- `src/features/dashboard/hooks/useClinicalRecordList.ts`: filtra e conta os registros do histórico.
- `src/features/dashboard/hooks/useDashboardOverview.ts`: organiza os atendimentos e pacientes mais recentes.
- `src/features/dashboard/hooks/usePatientStats.ts`: conta os registros do paciente para os cartões de resumo.

Cada componente visual tem seu próprio arquivo. Componentes como `AppShell`, `SchedulingDashboard` e `ClinicalRecordList` servem para juntar componentes menores.
