# Finanças Pessoais PRO Web

SPA em HTML, CSS e JavaScript puro para consumir a API REST Finanças Pessoais PRO.

## Pré-requisitos

- API disponível (por padrão em `http://localhost:8080/api`).
- Servidor estático simples (`npx serve`, `python -m http.server`, etc.).

## Como rodar

1. Instale um servidor estático global ou use o npx:
   ```bash
   npx serve financas-pessoais-pro-web
   ```
2. Abra `http://localhost:3000/public` (ou porta informada) no navegador.
3. Faça login (`#/login`) ou cadastro (`#/signup`).

## Configurando a API

- Valor padrão em `src/config.js` (`window.CONFIG.API_BASE_URL`).
- Também pode ser ajustado em tempo de execução na tela **Configurações** (`#/settings`). O valor fica salvo em `localStorage` (`fp:api_url`).

## Estrutura de rotas

| Rota          | Descrição                                |
| ------------- | ---------------------------------------- |
| `#/login`     | Autenticação                             |
| `#/signup`    | Cadastro                                 |
| `#/dashboard` | KPIs, gráficos e indicadores             |
| `#/accounts`  | CRUD de contas                           |
| `#/categories`| CRUD de categorias                       |
| `#/transactions` | Lançamentos com filtros               |
| `#/transfers` | Transferências entre contas              |
| `#/recurrings`| Regras recorrentes                       |
| `#/budgets`   | Metas por categoria                      |
| `#/reports`   | Relatórios (summary, cashflow, categorias)|
| `#/settings`  | Perfil, tema e API                       |

## Atalhos de teclado

- `ESC`: fecha modais.
- `/`: foca na busca global.
- `g` + `d`: leva ao Dashboard.

## Prints

> Capturas podem ser adicionadas manualmente na pasta `public/` se necessário.

## Desenvolvimento

- Código organizado em módulos ES2022 (`src/`).
- Roteamento via hash, protegido por token JWT (`localStorage` `fp:token`).
- Tema dark/light com persistência (`localStorage` `fp:theme`).
- Service Worker simples (`src/sw.js`) cacheia assets estáticos.
- Componentes reutilizáveis (`src/components`) e efeitos (`src/effects`).

## Testes rápidos

1. Ajuste `CONFIG.API_BASE_URL` se necessário.
2. Inicie o servidor estático.
3. Execute fluxo completo: cadastro → dashboard → CRUDs.

## Licença

Uso interno / demonstração.
