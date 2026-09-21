# SUSpiro — Guia detalhado para executar o projeto localmente

Este guia explica, passo a passo, como preparar uma máquina nova e executar o projeto SUSpiro.

A ideia é que qualquer pessoa da equipe consiga seguir este documento mesmo sem conhecer o projeto anteriormente.

> **Importante:** todos os comandos abaixo foram pensados para uso com **Git Bash no Windows**.

---

# 1. Ordem correta para executar o projeto

Não pule etapas.

A ordem correta é:

```text
1. Instalar as ferramentas
2. Instalar e iniciar o PostgreSQL
3. Criar o banco suspiro_central
4. Abrir a pasta do projeto na IDE
5. Abrir o Git Bash na pasta Projeto completo integrado
6. Entrar na pasta do backend
7. Transformar .env.exemplo em .env
8. Preencher o .env
9. Iniciar o backend com o comando ./mvnw clean spring-boot:run
10. Confirmar que o backend iniciou
11. Abrir outro terminal
12. Entrar na pasta do frontend
13. Instalar as dependências com o comando npm i
14. Conferir a configuração do frontend
15. Iniciar o frontend com o comando npm run dev
16. Abrir o sistema no navegador
17. Fazer login
```

O fluxo final será:

```text
PostgreSQL
     ↓
Banco suspiro_central
     ↓
Backend Spring Boot
localhost:8080
     ↓
Frontend React/Vite
localhost:5173
     ↓
Navegador
```

---

# 2. Estrutura do projeto

Depois de baixar ou extrair o projeto, a estrutura principal deve ser:

```text
Projeto completo integrado/
│
├── SUSpiro-Api-BackEnd-main/
│
└── SUSpiro-Api-FrontEnd-develop/
```

O backend e o frontend são projetos separados.

```text
Projeto completo integrado
│
├── Backend
└── Frontend
```

---

# 3. Ferramentas necessárias

A máquina precisa ter:

* Git
* Node.js
* Java 21
* PostgreSQL
* VS Code ou IntelliJ IDEA

## Versões utilizadas

### Node.js

```text
20.19.0 ou superior
```

### Java

```text
21
```

### PostgreSQL

```text
17 ou compatível
```

---

# 4. Conferir as ferramentas

Abra o **Git Bash**.

## Git

```bash
git --version
```

## Node.js

```bash
node --version
```

## npm

```bash
npm --version
```

## Java

```bash
java -version
```

## PostgreSQL

```bash
psql --version
```

Se todos os comandos retornarem suas versões, a máquina está pronta para continuar.

---

# 5. Baixar o projeto

Se o projeto estiver em um repositório Git:

```bash
git clone URL_DO_REPOSITORIO
```

Depois abra a pasta:

```text
Projeto completo integrado
```

Se o projeto foi entregue em `.zip`:

1. Extraia o arquivo.
2. Localize a pasta `Projeto completo integrado`.
3. Abra essa pasta no VS Code ou IntelliJ.

---

# 6. Abrir o projeto na IDE

No VS Code ou IntelliJ, abra:

```text
Projeto completo integrado
```

Não abra apenas a pasta do backend.

A estrutura deve aparecer aproximadamente assim:

```text
Projeto completo integrado
├── SUSpiro-Api-BackEnd-main
└── SUSpiro-Api-FrontEnd-develop
```

---

# 7. Onde abrir o Git Bash

Esta parte é importante porque evita problemas com caminhos.

Abra o **Git Bash diretamente dentro da pasta**:

```text
Projeto completo integrado
```

No Windows, você pode:

1. Abrir a pasta no Explorer.
2. Clicar com o botão direito.
3. Escolher **Open Git Bash here**, quando disponível.

Depois execute:

```bash
pwd
```

O caminho será parecido com:

```text
/c/Users/Annde/Downloads/Projeto completo integrado
```

ou:

```text
/c/Users/Annde/Desktop/Projeto completo integrado
```

O caminho pode mudar de máquina para máquina.

O que precisa ser igual é que o final seja:

```text
Projeto completo integrado
```

---

# 8. Iniciar o PostgreSQL

O PostgreSQL precisa estar funcionando **antes do backend**.

No Windows, confirme que o serviço PostgreSQL está iniciado.

Também é possível verificar pelo pgAdmin.

Configuração padrão usada pelo projeto:

```text
Host: localhost
Porta: 5432
Usuário: postgres
```

A senha será a senha definida durante a instalação do PostgreSQL.

---

# 9. Criar o banco `suspiro_central`

O backend utiliza o banco:

```text
suspiro_central
```

Esse banco precisa ser criado antes de iniciar o Spring Boot.

## Opção 1 — usando pgAdmin

Abra o pgAdmin.

Depois:

```text
Servers
└── PostgreSQL
    └── Databases
```

Clique com o botão direito em:

```text
Databases
```

Depois:

```text
Create
└── Database
```

Informe:

```text
suspiro_central
```

Salve.

---

# 10. Criar o banco pelo terminal

Também é possível criar pelo Git Bash.

Execute:

```bash
psql -U postgres
```

Digite a senha do PostgreSQL.

Depois:

```sql
CREATE DATABASE suspiro_central;
```

Para conferir:

```sql
\l
```

Procure:

```text
suspiro_central
```

Para sair:

```sql
\q
```

---

# 11. Entrar na pasta do backend

Agora estamos na pasta:

```text
Projeto completo integrado
```

Execute:

```bash
cd "SUSpiro-Api-BackEnd-main"
```

O terminal agora estará dentro de:

```text
Projeto completo integrado/SUSpiro-Api-BackEnd-main
```

Confira:

```bash
pwd
```

Depois:

```bash
ls
```

Você deverá encontrar arquivos como:

```text
.env.exemplo
mvnw
mvnw.cmd
pom.xml
src
```

---

# 12. Transformar `.env.exemplo` em `.env`

O projeto possui um arquivo:

```text
.env.exemplo
```

Esse arquivo é um modelo de configuração.

Precisamos criar o arquivo que será realmente utilizado pelo backend:

```text
.env
```

No Git Bash, dentro da pasta do backend, execute:

```bash
mv .env.exemplo .env
```

Agora confira:

```bash
ls -la
```

Deverá aparecer:

```text
.env
```

---

# 13. Onde o `.env` deve ficar

O arquivo deve estar diretamente na raiz do backend:

```text
SUSpiro-Api-BackEnd-main/
│
├── .env
├── pom.xml
├── mvnw
├── mvnw.cmd
└── src/
```

Não coloque o `.env` dentro de:

```text
src/
```

Nem dentro de:

```text
src/main/resources/
```

---

# 14. Abrir o `.env`

No VS Code, abra:

```text
SUSpiro-Api-BackEnd-main/.env
```

No Git Bash, se o comando `code` estiver configurado:

```bash
code .env
```

---

# 15. Preencher o `.env`

O arquivo deve conter as configurações da sua máquina.

Use este modelo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=suspiro_central
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_DO_POSTGRES

SERVER_PORT=8080

SUPER_ADMIN_CPF=SEU_CPF_DE_TESTE
SUPER_ADMIN_PASSWORD=SUA_SENHA_DE_TESTE
SUPER_ADMIN_NOME=Administrador Local

JWT_SECRET=SUA_CHAVE_JWT_LOCAL_SEGURA
JWT_EXPIRATION=86400000

FRONTEND_URL=http://localhost:5173
SWAGGER_ENABLED=false
```

---

# 16. O que preencher no `.env`

## Banco

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=suspiro_central
DB_USER=postgres
```

Normalmente esses valores não precisam ser alterados.

---

## Senha do PostgreSQL

Altere:

```env
DB_PASSWORD=SUA_SENHA_DO_POSTGRES
```

para a senha que foi cadastrada no PostgreSQL.

Exemplo:

```env
DB_PASSWORD=MinhaSenhaLocal123
```

---

# 17. Configuração do servidor

Mantenha:

```env
SERVER_PORT=8080
```

Isso significa que o backend ficará disponível em:

```text
http://localhost:8080
```

---

# 18. Configuração do SUPER_ADMIN

Preencha:

```env
SUPER_ADMIN_CPF=SEU_CPF_DE_TESTE
SUPER_ADMIN_PASSWORD=SUA_SENHA_DE_TESTE
SUPER_ADMIN_NOME=Administrador Local
```

Exemplo:

```env
SUPER_ADMIN_CPF=12345678909
SUPER_ADMIN_PASSWORD=AdminLocal123!
SUPER_ADMIN_NOME=Administrador Local
```

Esse usuário será utilizado no primeiro login.

---

# 19. Configuração do JWT

Preencha:

```env
JWT_SECRET=SUA_CHAVE_JWT_LOCAL_SEGURA
```

Exemplo:

```env
JWT_SECRET=SUSpiro-local-chave-segura-123456789
```

Também mantenha:

```env
JWT_EXPIRATION=86400000
```

---

# 20. Configuração do frontend no backend

Mantenha:

```env
FRONTEND_URL=http://localhost:5173
```

Essa é a porta padrão usada pelo Vite.

---

# 21. Swagger

Para executar o sistema normalmente:

```env
SWAGGER_ENABLED=false
```

Não é necessário habilitar o Swagger para usar a aplicação.

---

# 22. Exemplo completo do `.env`

O arquivo poderá ficar assim:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=suspiro_central
DB_USER=postgres
DB_PASSWORD=MinhaSenhaLocal123

SERVER_PORT=8080

SUPER_ADMIN_CPF=12345678909
SUPER_ADMIN_PASSWORD=AdminLocal123!
SUPER_ADMIN_NOME=Administrador Local

JWT_SECRET=SUSpiro-local-chave-segura-123456789
JWT_EXPIRATION=86400000

FRONTEND_URL=http://localhost:5173
SWAGGER_ENABLED=false
```

> Os valores acima são exemplos. Cada desenvolvedor deve usar os dados da própria máquina.

---

# 23. Iniciar o backend

Depois de:

```text
PostgreSQL iniciado
Banco suspiro_central criado
.env preenchido
```

confirme que o terminal ainda está na pasta:

```text
SUSpiro-Api-BackEnd-main
```

Confira:

```bash
pwd
```

Depois execute:

```bash
./mvnw clean spring-boot:run
```

---

# 24. Por que usamos `./mvnw clean spring-boot:run`

Esse comando:

```bash
./mvnw clean spring-boot:run
```

faz:

```text
1. Limpa arquivos compilados antigos
2. Compila o backend
3. Compila os testes
4. Inicia o Spring Boot
5. Conecta no PostgreSQL
6. Verifica as migrations
7. Inicia a API
```

---

# 25. Como saber se o backend iniciou corretamente

No terminal procure:

```text
Tomcat started on port 8080
```

e:

```text
Started SuspiroApplication
```

Quando aparecer:

```text
Started SuspiroApplication
```

o backend está executando.

A API está disponível em:

```text
http://localhost:8080
```

---

# 26. Verificar o banco no log

Durante a inicialização, o backend deverá mostrar a conexão com o PostgreSQL.

Também deverá aparecer algo parecido com:

```text
Successfully validated migrations
```

e:

```text
Schema "public" is up to date
```

Isso indica que as migrations foram verificadas.

---

# 27. Testar o Health Check

Com o backend rodando, abra:

```text
http://localhost:8080/actuator/health
```

A aplicação deve retornar um status indicando que está saudável.

---

# 28. NÃO feche o terminal do backend

Depois que o backend iniciar:

**não feche o terminal.**

Ele precisa continuar executando.

Deixe assim:

```text
Terminal 1
└── SUSpiro-Api-BackEnd-main
    └── ./mvnw clean spring-boot:run
```

Agora abra um **segundo Git Bash**.

---

# 29. Entrar na pasta do frontend

No novo Git Bash, vá para a pasta:

```text
Projeto completo integrado
```

Se o terminal já estiver nessa pasta, execute:

```bash
cd "SUSpiro-Api-FrontEnd-develop"
```

O caminho será:

```text
Projeto completo integrado/SUSpiro-Api-FrontEnd-develop
```

Confira:

```bash
pwd
```

Depois:

```bash
ls
```

Você deverá encontrar:

```text
package.json
package-lock.json
src
vite.config.ts
```

---

# 30. Atalho para ir do backend para o frontend

Caso você ainda esteja dentro de:

```text
SUSpiro-Api-BackEnd-main
```

não precisa voltar manualmente.

Use:

```bash
cd "../SUSpiro-Api-FrontEnd-develop"
```

Esse comando funciona porque as duas pastas ficam no mesmo nível:

```text
Projeto completo integrado/
├── SUSpiro-Api-BackEnd-main/
└── SUSpiro-Api-FrontEnd-develop/
```

---

# 31. Instalar as dependências do frontend

Na primeira configuração da máquina execute:

```bash
npm install
```

Também é possível usar:

```bash
npm i
```

ou:

```bash
npm ci
```

O projeto possui `package-lock.json`.

Para uma configuração reproduzível, `npm ci` é recomendado.

Para quem está seguindo este guia pela primeira vez:

```bash
npm install
```

é o comando mais simples de entender.

---

# 32. Configuração do frontend

Durante o desenvolvimento local, o frontend usa:

```text
/api
```

e o Vite encaminha essa chamada para:

```text
http://localhost:8080
```

Fluxo:

```text
Frontend
localhost:5173
      ↓
/api
      ↓
Vite Proxy
      ↓
Backend
localhost:8080
```

Se o projeto já estiver com essa configuração, não é necessário informar a URL completa do backend.

---

# 33. `.env` do frontend

Caso o projeto esteja usando `.env` no frontend, ele deverá ficar em:

```text
SUSpiro-Api-FrontEnd-develop/.env
```

A configuração local deverá ser:

```env
VITE_API_URL=/api
```

Não coloque:

```env
VITE_API_URL=http://localhost:8080
```

quando estiver usando o proxy local configurado pelo projeto.

---

# 34. Iniciar o frontend

Ainda dentro de:

```text
SUSpiro-Api-FrontEnd-develop
```

execute:

```bash
npm run dev
```

O Vite deverá mostrar:

```text
Local: http://localhost:5173/
```

---

# 35. Abrir o sistema

Abra no navegador:

```text
http://localhost:5173
```

Agora o frontend deverá carregar.

---

# 36. Fazer login

Na tela de login, use os dados definidos no backend:

```env
SUPER_ADMIN_CPF=...
SUPER_ADMIN_PASSWORD=...
```

Exemplo:

```text
CPF: 12345678909
Senha: AdminLocal123!
```

---

# 37. Como os dois terminais devem ficar

## Terminal 1 — Backend

```bash
cd "SUSpiro-Api-BackEnd-main"
./mvnw clean spring-boot:run
```

Backend:

```text
http://localhost:8080
```

## Terminal 2 — Frontend

```bash
cd "SUSpiro-Api-FrontEnd-develop"
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 38. Sequência completa de comandos

Supondo que o Git Bash foi aberto diretamente dentro da pasta:

```text
Projeto completo integrado
```

## Terminal 1 — Backend

```bash
cd "SUSpiro-Api-BackEnd-main"
```

Transforme:

```text
.env.exemplo
```

em:

```text
.env
```

com:

```bash
mv .env.exemplo .env
```

Preencha o `.env`.

Depois:

```bash
./mvnw clean spring-boot:run
```

Aguarde:

```text
Started SuspiroApplication
```

Não feche esse terminal.

---

## Terminal 2 — Frontend

Abra outro Git Bash na pasta:

```text
Projeto completo integrado
```

Execute:

```bash
cd "SUSpiro-Api-FrontEnd-develop"
```

Depois:

```bash
npm install
```

E:

```bash
npm run dev
```

Abra:

```text
http://localhost:5173
```

---

# 39. Caminhos corretos dos projetos

A estrutura sempre será:

```text
Projeto completo integrado/
│
├── SUSpiro-Api-BackEnd-main/
│
└── SUSpiro-Api-FrontEnd-develop/
```

Portanto:

## Da raiz para o backend

```bash
cd "SUSpiro-Api-BackEnd-main"
```

## Da raiz para o frontend

```bash
cd "SUSpiro-Api-FrontEnd-develop"
```

## Do backend para o frontend

```bash
cd "../SUSpiro-Api-FrontEnd-develop"
```

## Do frontend para o backend

```bash
cd "../SUSpiro-Api-BackEnd-main"
```

## Voltar uma pasta

```bash
cd ..
```

---

# 40. Exemplo real de caminho no Windows

Cada computador terá um caminho diferente.

Por exemplo:

```text
C:\Users\Annde\Downloads\Projeto completo integrado
```

No Git Bash isso aparece como:

```text
/c/Users/Annde/Downloads/Projeto completo integrado
```

Se o projeto estiver dentro dessa pasta, o comando para entrar no backend continua sendo apenas:

```bash
cd "SUSpiro-Api-BackEnd-main"
```

Isso torna o guia independente do nome do usuário e do local onde o projeto foi extraído.

---

# 41. Não use caminhos absolutos no dia a dia

Evite colocar no guia algo como:

```bash
cd "C:/Users/Annde/Downloads/Projeto final/Projeto completo integrado/SUSpiro-Api-BackEnd-main"
```

Esse caminho funciona somente para uma determinada máquina.

Prefira:

```bash
cd "SUSpiro-Api-BackEnd-main"
```

desde que o terminal esteja aberto na raiz:

```text
Projeto completo integrado
```

---

# 42. Se o Git Bash abrir em outro lugar

Se o terminal estiver, por exemplo:

```text
/c/Users/Annde
```

você precisa primeiro chegar à pasta do projeto.

Exemplo:

```bash
cd ~/Downloads
```

Depois:

```bash
cd "Projeto completo integrado"
```

Depois:

```bash
cd "SUSpiro-Api-BackEnd-main"
```

A diferença é somente onde o projeto foi salvo.

---

# 43. Como descobrir onde o projeto está

No Windows Explorer, encontre:

```text
Projeto completo integrado
```

Abra essa pasta.

Depois abra o Git Bash nela.

Use:

```bash
pwd
```

Assim você sempre saberá exatamente onde está.

---

# 44. Erros comuns

## `./mvnw: No such file or directory`

Você provavelmente não está na pasta do backend.

Faça:

```bash
cd "SUSpiro-Api-BackEnd-main"
```

Depois:

```bash
./mvnw clean spring-boot:run
```

---

## `Permission denied`

Execute:

```bash
chmod +x mvnw
```

Depois:

```bash
./mvnw clean spring-boot:run
```

---

## `.\mvnw.cmd: command not found`

Você está usando Git Bash.

Use:

```bash
./mvnw clean spring-boot:run
```

No PowerShell seria:

```powershell
.\mvnw.cmd clean spring-boot:run
```

---

## Banco não conecta

Confira o `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=suspiro_central
DB_USER=postgres
DB_PASSWORD=SUA_SENHA
```

Confirme também que o PostgreSQL está ligado.

---

## Banco `suspiro_central` não existe

Crie:

```sql
CREATE DATABASE suspiro_central;
```

---

## Frontend não conecta ao backend

Primeiro veja se:

```text
http://localhost:8080/actuator/health
```

está funcionando.

Depois confira o frontend:

```env
VITE_API_URL=/api
```

Reinicie:

```bash
npm run dev
```

---

# 45. Testes

## Backend

Entre na pasta:

```bash
cd "SUSpiro-Api-BackEnd-main"
```

Execute:

```bash
./mvnw test
```

## Frontend

Entre na pasta:

```bash
cd "../SUSpiro-Api-FrontEnd-develop"
```

Execute:

```bash
npm run typecheck
```

Depois:

```bash
npm run test:run
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

---

# 46. Fluxo diário da equipe

Depois que a máquina já estiver configurada, normalmente não será necessário repetir a configuração do banco ou executar `npm install` diariamente.

## Terminal 1

```bash
cd "Projeto completo integrado/SUSpiro-Api-BackEnd-main"
./mvnw spring-boot:run
```

## Terminal 2

```bash
cd "Projeto completo integrado/SUSpiro-Api-FrontEnd-develop"
npm run dev
```

Depois abra:

```text
http://localhost:5173
```

---

# 47. Quando usar `clean`

Na primeira execução ou quando houver problemas com arquivos compilados antigos:

```bash
./mvnw clean spring-boot:run
```

Depois, normalmente:

```bash
./mvnw spring-boot:run
```

é suficiente.

---

# 48. Quando usar `npm install`

Use principalmente:

```bash
npm install
```

quando:

* estiver configurando uma máquina nova;
* o `package.json` mudar;
* novas dependências forem adicionadas;
* a pasta `node_modules` não existir.

Depois, normalmente:

```bash
npm run dev
```

já é suficiente.

---

# 49. Checklist de uma máquina nova

Antes de começar a trabalhar:

```text
[ ] Git instalado
[ ] Node.js >= 20.19 instalado
[ ] Java 21 instalado
[ ] PostgreSQL instalado
[ ] PostgreSQL iniciado
[ ] Projeto extraído/clonado
[ ] Pasta Projeto completo integrado aberta
[ ] Banco suspiro_central criado
[ ] Backend aberto
[ ] .env.exemplo renomeado para .env
[ ] DB_PASSWORD preenchido
[ ] SUPER_ADMIN_CPF preenchido
[ ] SUPER_ADMIN_PASSWORD preenchido
[ ] JWT_SECRET preenchido
[ ] Backend iniciado
[ ] "Started SuspiroApplication" apareceu
[ ] /actuator/health funcionando
[ ] Segundo terminal aberto
[ ] Frontend aberto
[ ] npm install executado
[ ] VITE_API_URL=/api configurado, quando aplicável
[ ] npm run dev executado
[ ] http://localhost:5173 abriu
[ ] Login funcionando
```

---

# 50. Resumo rápido

## Backend

Na pasta:

```text
Projeto completo integrado
```

execute:

```bash
cd "SUSpiro-Api-BackEnd-main"
```

Depois:

```bash
mv .env.exemplo .env
```

Preencha o `.env`.

Depois:

```bash
./mvnw clean spring-boot:run
```

Aguarde:

```text
Started SuspiroApplication
```

---

## Frontend

Abra outro Git Bash na pasta:

```text
Projeto completo integrado
```

Execute:

```bash
cd "SUSpiro-Api-FrontEnd-develop"
```

Depois:

```bash
npm install
```

E:

```bash
npm run dev
```

Abra:

```text
http://localhost:5173
```

---

# 51. Fluxo final

```text
┌───────────────────────────┐
│       PostgreSQL          │
│      localhost:5432       │
│   Banco: suspiro_central  │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│       Spring Boot         │
│      localhost:8080       │
│ ./mvnw clean spring...    │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│       React + Vite        │
│      localhost:5173       │
│      npm run dev          │
└─────────────┬─────────────┘
              │
              ▼
        ┌───────────┐
        │ Navegador │
        │  :5173    │
        └───────────┘
```

## Regra principal

Sempre siga:

```text
1. PostgreSQL
2. Banco suspiro_central
3. .env do backend
4. ./mvnw clean spring-boot:run
5. Backend iniciado
6. Segundo terminal
7. npm install
8. npm run dev
9. http://localhost:5173
10. Login
```

Essa é a forma padrão de executar o SUSpiro localmente na equipe.
