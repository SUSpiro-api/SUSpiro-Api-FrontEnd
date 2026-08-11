# Fluxo Vital
> (nome temporário, a definir pela equipe)

Sistema web para gestão e otimização de fluxo de requisições em Unidades Básicas de Saúde (UBS). Projeto de desenvolvimento Full-Stack, curso +praTi e Codifica (2026).

## REGRAS DE CONTRIBUIÇÃO (LEITURA OBRIGATÓRIA PARA A EQUIPE)
#### PROIBIDO FAZER PUSH DIRETO NA BRANCH MAIN
Como o repositório é privado no plano gratuito, a branch main não possui trava automática via sistema. Por isso, combinamos as seguintes regras para garantir a integridade do projeto:
1. Nunca suba código direto na main (`git push origin main`).
2. Crie uma branch separada para cada funcionalidade ou correção:
`git checkout -b feature/nome-da-sua-tarefa` ou `fix/descricao-do-bug`
3. Abra um `Pull Request (PR)` da sua branch apontando para `develop` ao terminar.
4. Solicite a revisão de pelo menos um colega do grupo antes de realizar o `merge`.

---

#### COMO EXECUTAR O PROJETO LOCALMENTE

Siga as instruções abaixo para rodar a aplicação em seu ambiente de desenvolvimento.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

`Node.js >= 18.0.0`

`npm >= 9.0.0 (ou yarn/pnpm)`

`Git`

(Opcional) Docker (para execução de serviços locais)

---

## 🚀 Como rodar o projeto localmente

### 1. Clone o repositório
`
git clone <URL-DO-REPOSITORIO>
cd <NOME-DA-PASTA-DO-PROJETO>
`
### 2. Instale as dependências
`
npm install
`
### 3. Configure as variáveis de ambiente

Copie o arquivo .env.example para .env.local:
`
cp .env.example .env.local
`
### 4. Edite o arquivo .env.local com as suas chaves e configurações locais.
Variáveis obrigatórias:

`PORT` - Porta onde a aplicação rodará (ex: 3000)

`DATABASE_URL` - (A definir na reunião de alinhamento)

---

## 🗄️ Banco de Dados

(Status: Banco de dados em definição pelo time)

Opções em avaliação: `PostgreSQL, SQLite, MongoDB ou Supabase.`

ORM / Driver: `(A definir - ex: Prisma, Sequelize ou TypeORM).`

---

## 🛠️ Scripts Disponíveis

Desenvolvimento

`npm run dev`- Inicia o servidor de desenvolvimento

`npm run build`- Cria a build de produção

`npm run start`- Inicia o servidor de produção

`npm run lint`- Executa a verificação de código (linter)

---

## 📂 Estrutura do Projeto
```
meu-projeto/
├── src/
│   ├── components/    # Componentes reutilizáveis
│   ├── pages/         # Ou app/ (Rotas da aplicação)
│   ├── services/      # Integrações de API / Serviços
│   └── styles/        # Estilos globais
├── public/            # Arquivos estáticos (imagens, ícones)
├── .env.example       # Modelo de variáveis de ambiente
└── README.md          # Documentação do repositório
```

---

## 🔒 Segurança

Nunca commite o arquivo `.env`
 ou `
.env.local no Git.`

Sempre mantenha apenas o `
.env.example`
atualizado no repositório com os nomes das variáveis (sem valores reais/sensíveis).

---

## 🤝 Contribuindo & Fluxo de Git

Utilizamos o padrão de branches para organização do projeto:

`main`: Branch de produção (versão final e estável do projeto).

`develop`: Branch de desenvolvimento (onde todas as funcionalidades são integradas antes de irem para a final).

### Passo a passo para contribuir:

Garanta que está na branch develop atualizada:
```
git checkout develop
git pull origin develop
```
Crie uma branch para sua feature `(git checkout -b feature/nome-da-feature)`

Faça os seus commits `(git commit -m 'feat: minha nova feature')`

Envie para o repositório `(git push origin feature/nome-da-feature)`

Abra um `Pull Request` para análise do time

---

## 🆘 Suporte & Troubleshooting

Se encontrar problemas ao rodar o projeto, verifique:

Se a sua versão do `Node.js` é compatível.

Se executou o `npm install` após atualizar as dependências.

Se o arquivo `.env.local` foi criado corretamente na raiz do projeto.

---
