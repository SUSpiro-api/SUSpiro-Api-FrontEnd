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

## Rotas

| Rota | Acesso | Tela |
| --- | --- | --- |
| `/` e `/login` | pública | Login por CPF (sem sessão) ou home (com sessão) |
| `/recuperar-senha` | pública | Recuperação de senha |
| `/cadastro-cidadao` | `SUPER_ADMIN`, `ADMIN`, `MEDICO`, `ENFERMEIRO`, `RECEPCIONISTA` | Cadastro de cidadão (`POST /pacientes`) |
| `/cadastro-funcionario` | `ADMIN`, `SUPER_ADMIN` | Cadastro de funcionário (`POST /usuarios`) |

Não há autocadastro: contas são criadas por um administrador, por isso a tela de login não tem "Criar conta".
As permissões do frontend só escondem telas; quem garante o acesso de verdade é o back-end (`@PreAuthorize`).

## Sessão

O token JWT vale pelo tempo definido em `JWT_EXPIRATION` no back-end. O frontend encerra a sessão e volta
ao login quando (a) o back-end responde 401, ou (b) o tempo do token acaba, mesmo com a tela parada
(`features/auth/session.ts`).

## Recuperação de senha (pendente no back-end)

O back-end ainda **não** implementa `POST /auth/password/forgot`. Enquanto isso, a tela avisa que a recuperação
por e-mail não está disponível e orienta procurar o administrador da unidade. Quando o endpoint existir,
nenhuma mudança é necessária no frontend: uma resposta de sucesso já leva à tela "Verifique seu e-mail".

## Validações alinhadas ao back-end

O frontend valida antes de enviar o que o back-end também exige, para o usuário ver o erro no campo:
nome de 3 a 150 caracteres, CPF válido, senha de funcionário com 8 a 72 caracteres com letra e número,
CNS com 15 dígitos, telefone com DDD (opcional) e data de nascimento estritamente no passado.

## Design e tema

O visual do app logado é um design system em camadas, pensado para ser distribuído a outras organizações
(clínica, prefeitura, SUS) trocando só a identidade:

| Camada | Arquivo | O que tem |
| --- | --- | --- |
| Escala | `src/styles/tokens.css` | Espaçamento, raios, tipografia, sombras, tamanhos de controle. Não depende do tema. |
| Tema | `src/styles/themes/clinica.css` | Cores como **papéis** (`--color-action`, `--color-surface`, `--color-border-strong`...) e a fonte. |
| Marca | `src/config/brand.ts` | Nome da instalação exibido nas telas logadas. |

Os componentes só usam os papéis, nunca cores soltas. Para criar outra instalação, copie `clinica.css`,
troque os valores e importe o novo arquivo em `styles/global.css`.

- **Contraste garantido por teste.** `styles/themes/contrast.test.ts` calcula o contraste de cada par de cores
  do tema e falha o build se algum ficar abaixo de WCAG 2.2 AA (texto 4,5:1; bordas e componentes 3:1).
- **Fonte.** O tema usa `Inter` com fallback para a fonte do sistema. Para embutir a Inter (sem depender de
  CDN): `npm i @fontsource-variable/inter` e `import '@fontsource-variable/inter'` em `src/main.tsx`.
- **Ícones** são SVG embutidos (`components/icons`), sem Google Fonts: continuam aparecendo em redes que o bloqueiam.
- **Acessibilidade:** link "Ir para o conteúdo", foco visível, foco no conteúdo ao trocar de tela, título
  diferente em cada tela, menu em gaveta no celular, erros ligados aos campos por ARIA e foco no primeiro
  campo inválido.
- **Dados pessoais mascarados** nas telas (`utils/mask.ts`): CPF e CNS mostram só os últimos dígitos.

**Login e recuperação de senha mantêm o design original.** Os tokens antigos dessas telas ficam isolados em
`src/components/Login/legacy-tokens.css`, restritos a `.login-page`, e os componentes delas estão em
`src/components/Login/ui`. Assim o restante do app evolui sem alterar essas telas.

## Testes

A suíte cobre utilitários de CPF, validações, políticas de autorização, sessão/JWT no frontend, cliente HTTP, login, cadastro de funcionário e validações de cidadão.

Há também testes unitários no backend para validação de CPF, serviços de usuários e cidadãos e emissão/validação de JWT.

## Fluxo de guias e agendamento

O dashboard profissional agora separa os papéis do fluxo de atendimento:

- **Médico:** seleciona o paciente, escolhe o tipo de guia e, para consultas, informa também o **tipo de consulta**. A data solicitada deve ser hoje ou uma data futura.
- **Recepção/Enfermagem:** acessa a **Fila de guias**, que busca no back-end todas as guias com status `AGUARDANDO_AGENDAMENTO`. A tela atualiza automaticamente a fila e permite definir data e horário do agendamento.
- **Confirmação:** depois de `Salvar registro`, a tela mostra o modal **“Guia gerada com sucesso”** e informa que a solicitação foi encaminhada para a fila de agendamento.

As regras de data são duplicadas de propósito: o frontend bloqueia datas anteriores à data local de hoje e o back-end valida novamente a mesma regra antes de persistir a guia.

Endpoints usados pelo fluxo:

| Endpoint | Perfis | Objetivo |
| --- | --- | --- |
| `POST /guias` | `MEDICO`, `ADMIN`, `SUPER_ADMIN` | Gerar uma nova guia |
| `GET /guias/minhas` | `MEDICO`, `ADMIN`, `SUPER_ADMIN` | Consultar guias criadas pelo usuário |
| `GET /guias/pendentes` | `ENFERMEIRO`, `RECEPCIONISTA`, `ADMIN`, `SUPER_ADMIN` | Listar a fila de agendamento |
| `PATCH /guias/{id}/agendamento` | `ENFERMEIRO`, `RECEPCIONISTA`, `ADMIN`, `SUPER_ADMIN` | Registrar o agendamento e mudar o status para `AGENDADO` |

A migração `V3__create_guias.sql` cria a tabela persistente das guias.
