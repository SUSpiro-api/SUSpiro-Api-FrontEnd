<<<<<<< HEAD
# fluxovital
Sistema web para gestão e otimização de fluxo de requisições em Unidades Básicas de Saúde (UBS). Projeto de desenvolvimento Full-Stack, curso +praTi e Codifica (2026).

> **REGRAS DE CONTRIBUIÇÃO (LEITURA OBRIGATÓRIA PARA A EQUIPE)**
> **PROIBIDO FAZER PUSH DIRETO NA BRANCH MAIN**
> Como o repositório é privado no plano gratuito, a branch main não possui trava automática via sistema. Por isso, combinamos as seguintes regras para garantir a integridade do projeto:
> 1. Nunca suba código direto na main (`git push origin main`).
> 2. Crie uma branch separada para cada funcionalidade ou correção:
> `git checkout -b feature/nome-da-sua-tarefa` ou `fix/descricao-do-bug`
> 3. Abra um Pull Request (PR) da sua branch apontando para a main ao terminar.
> 4. Solicite a revisão de pelo menos um colega do grupo antes de realizar o merge.
> 
> 

---

## Como Executar o Projeto Localmente

Siga as instruções abaixo para rodar a aplicação em seu ambiente de desenvolvimento.

### Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

* Git
* Node.js (Versão LTS recomendada)
* Editor de código de sua preferência (ex: VSCode)

---

### Passo a Passo

1. Clone o repositório:
```bash
git clone https://github.com/maisprati-fullstack/fluxovital.git
cd fluxovital

```


2. Instale as dependências:
```bash
npm install

```


3. Configuração de Variáveis de Ambiente:
* Duplique o arquivo `.env.example` (caso exista).
* Renomeie a cópia para `.env` e preencha as chaves conforme necessário.


4. Execute o projeto:
```bash
npm run dev

```


Acesse a aplicação no navegador através do endereço indicado no terminal (ex: `http://localhost:3000`).

---

## Fluxo do Dia a Dia de Trabalho (Git Workflow)

Sempre que for iniciar uma nova tarefa:

1. Volte para a main e atualize seu código local:
```bash
git checkout main
git pull origin main

```


2. Crie uma nova branch para a sua tarefa:
```bash
git checkout -b feature/minha-nova-feature

```


3. Desenvolva suas alterações e faça o commit:
```bash
git add .
git commit -m "feat: adiciona componente X"

```


4. Suba sua branch para o GitHub:
```bash
git push origin feature/minha-nova-feature

```


5. Vá no GitHub e abra o Pull Request (PR) para a branch main.
=======
# SUSpiro — Frontend

Aplicação web do SUSpiro, construída com React, TypeScript e Vite.

A interface atende pacientes e equipes de saúde com áreas separadas por perfil, fila de guias, agendamento, histórico de atendimentos e preferências de tema.

## Desenvolvimento

```bash
npm ci
npm run dev
```

O frontend utiliza `/api` como caminho padrão. O servidor de desenvolvimento encaminha as chamadas para o backend local em `http://localhost:8080`.

## Verificações

```bash
npm run typecheck
npm run typecheck:tests
npm run lint
npm run test:run
npm run build
```

Para requisitos, configuração de ambiente, arquitetura, segurança e implantação, consulte o [README principal](../README.md).
>>>>>>> master
