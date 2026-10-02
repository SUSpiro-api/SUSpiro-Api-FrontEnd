# SUSpiro Backend

API Spring Boot do SUSpiro com PostgreSQL, Flyway e autenticação JWT armazenada em cookie HttpOnly.

## Pré-requisitos

- Java 21
- PostgreSQL 17 ou compatível
- Git Bash (para usar `./mvnw`)

## Configuração local

1. Copie `.env.exemplo` para `.env`.
2. Crie o banco `suspiro_central`.
3. Preencha `DB_PASSWORD`, `SUPER_ADMIN_CPF`, `SUPER_ADMIN_PASSWORD` e `JWT_SECRET`.
4. Inicie o backend dentro desta pasta:

```bash
./mvnw clean spring-boot:run
```

A API ficará em `http://localhost:8080`.

## Autenticação

O login usa `POST /auth/login`. O JWT não é devolvido ao frontend: ele é colocado em `SUSPIRO_SESSION` com `HttpOnly`. O backend também cria `XSRF-TOKEN` para o frontend enviar no header `X-CSRF-TOKEN` em operações mutáveis.

- `POST /auth/login` → cria os cookies e retorna o usuário autenticado.
- `GET /auth/me` → restaura a sessão atual.
- `POST /auth/logout` → expira os cookies.

O backend continua aceitando `Authorization: Bearer <token>` para compatibilidade com clientes legados.

## Health check

- `GET http://localhost:8080/actuator/health`

## Swagger

- `http://localhost:8080/swagger-ui.html`

## Guias e agendamento

O backend integrado também fornece a API de guias usada pelo dashboard:

- `POST /guias` — médico/enfermagem cria uma guia.
- `GET /guias/minhas` — lista as guias do profissional autenticado.
- `GET /guias/pendentes` — fila para SUPER_ADMIN, ADMIN, ENFERMEIRO e RECEPCIONISTA.
- `PATCH /guias/{id}/agendamento` — agenda uma guia pendente.

As guias são persistidas no PostgreSQL pela migration `V3__create_guias.sql`.
