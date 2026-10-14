# Integração do frontend ao SUSpiro-Api

Este pacote consolida o frontend mais recente com os fluxos que existiam no frontend anterior. Ele contém somente o frontend; nenhum código do backend Spring Boot foi alterado porque o ZIP do backend não foi fornecido.

## Executar localmente

1. Instale Node.js `>=20.19.0`.
2. Copie `.env.example` para `.env`.
3. Inicie o backend SUSpiro na porta `8080`.
4. Na pasta do frontend, execute `npm ci` e depois `npm run dev`.
5. Acesse `http://localhost:5173`.

O proxy do Vite encaminha `/api/*` para `http://localhost:8080/*`, removendo o prefixo `/api`. Para mudar o endereço, configure `VITE_API_URL`.

## Autenticação

O padrão é `VITE_AUTH_MODE=legacy-bearer-memory`, compatível com a API anterior que devolve `{ "token": "...", "senhaProvisoria": false }` no `POST /auth/login`. O JWT fica somente em memória e, por isso, o usuário precisa entrar novamente após recarregar a página.

Só altere para `VITE_AUTH_MODE=cookie` se o backend implementar todos os pontos do contrato em `AUTH-BACKEND-CONTRACT.md`: cookie HttpOnly, `GET /auth/me`, `POST /auth/logout` e proteção CSRF.

## Dashboards e endpoints esperados

- **Médico:** localizar cidadão, visualizar o resumo/histórico e criar guias.
- **Recepção e enfermagem:** consultar a fila de guias pendentes e agendar.
- **Administração:** abrir a área clínica e alternar para a fila de guias.

O frontend consome os endpoints abaixo para o fluxo de guias:

- `POST /guias`
- `GET /guias/minhas`
- `GET /guias/pendentes`
- `PATCH /guias/{id}/agendamento`

A troca de senha provisória usa `PATCH /usuarios/me/senha` quando o login retorna `senhaProvisoria: true`. A criação de conta pública foi preservada visualmente para compatibilidade, mas o backend pode rejeitar `POST /usuarios` quando exigir autenticação administrativa; nesse caso, use o cadastro de funcionário por um perfil autorizado.

## Verificações

Execute `npm run typecheck`, `npm run typecheck:tests`, `npm run test:run` e `npm run build` depois de instalar dependências no seu sistema. Os testes de build e execução também dependem das bindings nativas do Vite/Rolldown para o sistema operacional local.
