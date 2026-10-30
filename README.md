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
