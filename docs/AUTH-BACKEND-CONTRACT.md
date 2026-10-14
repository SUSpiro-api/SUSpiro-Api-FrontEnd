# Contrato opcional de autenticação por cookie

Este documento descreve o contrato que o backend precisa implementar para usar `VITE_AUTH_MODE=cookie`. A entrega integrada mantém `legacy-bearer-memory` como padrão para ser compatível com o frontend anterior, que espera um JWT no corpo do login. Como o ZIP do backend não foi fornecido nesta tarefa, o contrato por cookie descrito abaixo não foi validado contra o backend real. O JWT do modo legado permanece somente em memória no frontend (não é persistido em storage).

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

## Compatibilidade com a API anterior

O modo padrão da entrega é:

```env
VITE_AUTH_MODE=legacy-bearer-memory
```

Ele espera `{ "token": "..." }` no corpo do login e envia o JWT como `Authorization: Bearer`. O token fica somente na memória e não sobrevive a um refresh.

## Ativar sessão por cookie

Use `VITE_AUTH_MODE=cookie` apenas depois de confirmar que o backend implementa todos os endpoints, cookies e regras CSRF documentados acima. Não é necessário mudar para esse modo para usar a UI dos dashboards.

## Integração com guias

O backend integrado também implementa as rotas consumidas pelo dashboard:

- `POST /guias`
- `GET /guias/minhas`
- `GET /guias/pendentes`
- `PATCH /guias/{id}/agendamento`

No modo `cookie`, essas rotas usam a sessão por cookie e, nas operações POST/PATCH, o frontend envia `X-CSRF-TOKEN`. No modo `legacy-bearer-memory`, o frontend envia `Authorization: Bearer` com o JWT recebido no login.
