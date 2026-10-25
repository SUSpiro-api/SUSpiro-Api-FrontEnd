# SUSpiro — Frontend

Frontend do SUSpiro, feito com React, TypeScript e Vite. O sistema tem login, recuperação e troca de senha, cadastro de cidadãos e funcionários, atendimento médico e agendamento de guias.

## 1. O que instalar

- Node.js `20.19.0` ou superior.
- npm (já vem com o Node.js).
- Backend Spring Boot em execução para acessar os dados reais.

## 2. Configurar o `.env`

Na pasta `SUSpiro-Api-FrontEnd`, copie o arquivo de exemplo e crie o seu `.env`.

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Linux, macOS ou Git Bash:**

```bash
cp .env.example .env
```

A configuração padrão usa o proxy do Vite para encaminhar `/api` ao backend em `http://localhost:8080`.

```env
VITE_API_URL=/api
VITE_AUTH_MODE=legacy-bearer-memory
VITE_AUTH_SESSION_PATH=/auth/me
VITE_AUTH_LOGOUT_PATH=/auth/logout
VITE_CSRF_COOKIE_NAME=XSRF-TOKEN
VITE_GUIDE_DATA_SOURCE=api
```

### Qual é a diferença entre os arquivos?

- **`.env`**: valores da sua máquina. Não deve ir para o Git.
- **`.env.example`**: exemplo sem segredos, versionado para ajudar outras pessoas a configurar o projeto.
- **`src/config/env.ts`**: código que lê as variáveis do Vite e fornece valores padrão para o resto do frontend.

Não troque `env.ts` por `.env`: eles têm funções diferentes. Também não coloque senhas ou chaves privadas em variáveis `VITE_*`, porque esses valores podem ser vistos no navegador.

### Variáveis usadas com mais frequência

| Variável | Valor padrão | Função |
| --- | --- | --- |
| `VITE_API_URL` | `/api` | Endereço-base da API. |
| `VITE_AUTH_MODE` | `legacy-bearer-memory` | Mantém o login compatível com o backend atual, que devolve o JWT na resposta. |
| `VITE_GUIDE_DATA_SOURCE` | `api` | Usa a API real. O valor `local` serve apenas para protótipos ou testes locais. |
| `VITE_AUTH_SESSION_PATH` | `/auth/me` | Endpoint usado no modo de sessão por cookie. |
| `VITE_AUTH_LOGOUT_PATH` | `/auth/logout` | Endpoint de encerramento de sessão por cookie. |
| `VITE_CSRF_COOKIE_NAME` | `XSRF-TOKEN` | Nome do cookie CSRF esperado no modo cookie. |

Mantenha `VITE_AUTH_MODE=legacy-bearer-memory` enquanto o backend não oferecer sessão por cookie `HttpOnly` e proteção CSRF compatíveis. Nesse modo, atualizar a página pode exigir novo login.

## 3. Instalar e executar

Abra o terminal na pasta do frontend e execute:

```bash
npm ci
npm run dev
```

Acesse `http://localhost:5173`. Se essa porta estiver ocupada, o Vite mostrará no terminal o endereço alternativo.

Para usar dados reais, confirme que o backend está rodando e acessível em `http://localhost:8080`.

## 4. Comandos úteis

```bash
npm run dev             # Inicia o frontend
npm run typecheck       # Verifica os tipos TypeScript
npm run typecheck:tests # Verifica os tipos dos testes
npm run test:run        # Executa os testes uma vez
npm run test:coverage   # Executa os testes com cobertura
npm run lint            # Analisa o código
npm run build           # Verifica os tipos e gera a versão de produção
npm run preview         # Abre a versão de produção localmente
```

Antes de enviar uma alteração, rode `npm run typecheck`, `npm run test:run`, `npm run lint` e `npm run build`.

## 5. Onde encontrar cada coisa

- `src/app/`: entrada da aplicação, seleção de telas, rotas e hooks da sessão.
- `src/hooks/`: comportamentos reutilizados, como abrir janelas, trocar abas pelo teclado e mostrar/ocultar senhas.
- `src/api/httpClient.ts`: comunicação com o backend e tratamento comum de erros HTTP.
- `src/components/`: elementos visuais reutilizados, como botões, campos, `Navbar`, menu lateral e ícones.
- `src/config/env.ts`: leitura das variáveis do frontend.
- `src/features/auth/`: login, sessão, permissões, recuperação e troca de senha.
- `src/features/dashboard/`: atendimento médico, histórico e fila de agendamento.
- `src/features/guides/`: criação, consulta e agendamento de guias.
- `src/features/patients/`: cadastro de cidadãos, validações e hook do formulário.
- `src/features/employees/`: cadastro de funcionários, validações e hook do formulário.
- `src/utils/`: funções reutilizáveis para CPF, máscaras, datas e armazenamento.
- `src/styles/`: estilos globais e temas.

A regra prática é: o componente mostra a tela; o hook controla o estado e as ações quando isso ajuda a leitura; o serviço cuida da operação; o cliente HTTP faz a requisição. Cada componente reutilizável deve ter seu próprio arquivo.

## 6. Funcionalidades principais

### Dashboard

A rota `/dashboard` mostra a área de atendimento ou a fila de guias, conforme o perfil autenticado.

- **Médico:** localiza o cidadão, consulta o histórico e cria guias de consulta, retorno, exame ou encaminhamento.
- **Recepção e enfermagem:** consultam guias pendentes e informam a data e o horário do agendamento.
- **ADMIN e SUPER_ADMIN:** podem acessar a área clínica conforme as permissões atuais.

O hook `src/features/dashboard/hooks/useDoctorDashboard.ts` reúne o estado e as ações do atendimento médico. O arquivo `src/features/dashboard/guideToClinicalRecord.ts` adapta uma guia para o formato usado no histórico.

### Cidadãos e funcionários

Os formulários, validações e chamadas de serviço ficam, respectivamente, em `src/features/patients/` e `src/features/employees/`.

### Guias

Os arquivos de `src/features/guides/` cuidam dos tipos, da criação e da consulta das guias. A aplicação pode usar a API real ou um repositório local de protótipo conforme `VITE_GUIDE_DATA_SOURCE` (`api`, `auto` ou `local`). O padrão é `api`: dados clínicos reais nunca devem ser persistidos no navegador. `auto` e `local` são apenas para demonstração com dados sintéticos.

## 7. Rotas principais

| Rota | Tela |
| --- | --- |
| `/` | Início |
| `/login` | Login |
| `/criar-conta` | Cadastro inicial mantido no projeto |
| `/recuperar-senha` | Recuperação de senha |
| `/cadastro-cidadao` | Cadastro de cidadão |
| `/cadastro-funcionario` | Cadastro de funcionário |
| `/dashboard` | Atendimento ou fila de guias |

A interface controla quais opções aparecem para cada perfil, mas o backend também precisa validar as permissões de cada operação.

Para ver uma explicação resumida das pastas, consulte [`ARCHITECTURE.md`](./ARCHITECTURE.md). Para os pontos de segurança, consulte [`SECURITY.md`](./SECURITY.md).
