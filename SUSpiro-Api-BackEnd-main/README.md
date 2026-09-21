# SUSpiro Backend

Backend da aplicação SUSpiro, construído com Java 21, Spring Boot e PostgreSQL.

## Como rodar no Windows com Git Bash

Abra o Git Bash dentro desta pasta e execute:

```bash
./mvnw spring-boot:run
```

Não use `\.\mvnw.cmd` no Git Bash. Esse formato é para PowerShell.

Se o Git Bash informar `Permission denied`, execute uma vez:

```bash
chmod +x mvnw
./mvnw spring-boot:run
```

Outra opção no Git Bash é chamar o script do Windows:

```bash
cmd.exe /c mvnw.cmd spring-boot:run
```

## Rodar com Docker

```bash
docker compose up -d --build
```

## Testes

Git Bash / Linux / macOS:

```bash
./mvnw test
```

PowerShell:

```powershell
.\mvnw.cmd test
```

## Variáveis de ambiente

Use `.env.exemplo` como referência e crie seu `.env` local.

Nunca versione credenciais reais.
