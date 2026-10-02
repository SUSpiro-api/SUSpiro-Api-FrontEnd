# Contrato de autenticação para integração com o backend

Frontend e backend integrados usam autenticação por sessão em cookie. O JWT permanece somente no servidor/HttpOnly e não fica acessível ao JavaScript.

## Login

`POST /auth/login`

Request:

```json
{
  "cpf": "00000000000",
  "senha": "senha"
}
```

A resposta cria a sessão e envia o cookie de autenticação HttpOnly:

```http
Set-Cookie: SUSPIRO_SESSION=...; HttpOnly; Secure; SameSite=Lax; Path=/
```

O corpo da resposta pode opcionalmente retornar o usuário:

```json
{
  "user": {
    "id": 123,
    "nome": "Nome do profissional",
    "perfil": "MEDICO"
  }
}
```

## Restaurar sessão

`GET /auth/me`

O frontend envia `credentials: include`.

Resposta esperada:

```json
{
  "user": {
    "id": 123,
    "nome": "Nome do profissional",
    "perfil": "MEDICO"
  }
}
```

Também é aceito que a própria resposta seja o objeto do usuário.

Sem sessão: `401 Unauthorized`.

## Logout

`POST /auth/logout`

O servidor invalida a sessão lógica (JWT deixa de ser usado pelo cliente) e expira os cookies de autenticação e CSRF.

## CSRF

Para autenticação por cookie, o backend integrado usa proteção CSRF por double-submit cookie. O contrato esperado pelo frontend é:

```http
Set-Cookie: XSRF-TOKEN=<token>; Secure; SameSite=Lax; Path=/
X-CSRF-TOKEN: <token>
```

O cookie de CSRF não deve ser HttpOnly porque o frontend precisa lê-lo para enviar o header. O cookie de sessão continua HttpOnly.

Operações mutáveis devem validar o header no backend.

## CORS

Se frontend e API estiverem em origens diferentes, o backend deve permitir a origem exata do frontend e `Access-Control-Allow-Credentials: true`. Não usar `Access-Control-Allow-Origin: *` junto com credenciais.

## Autorização

O frontend pode esconder rotas por perfil, mas o backend deve proteger os endpoints independentemente da interface. Os perfis esperados atualmente são `SUPER_ADMIN`, `ADMIN`, `MEDICO`, `ENFERMEIRO`, `RECEPCIONISTA` e `USUARIO`.

## Desenvolvimento com o backend legado

Para compatibilidade temporária com uma API antiga que ainda devolva JWT no corpo do login, pode-se usar:

```env
VITE_AUTH_MODE=legacy-bearer-memory
```

O token será mantido somente na memória e não sobreviverá a um refresh. Isso não é o modo recomendado para produção.

## Produção

Usar:

```env
VITE_AUTH_MODE=cookie
```

e as rotas configuradas em `.env` para sessão e logout.

## Integração com guias

O backend integrado também implementa as rotas consumidas pelo dashboard:

- `POST /guias`
- `GET /guias/minhas`
- `GET /guias/pendentes`
- `PATCH /guias/{id}/agendamento`

Essas rotas usam a mesma autenticação por cookie e, nas operações POST/PATCH, o frontend envia `X-CSRF-TOKEN`.
