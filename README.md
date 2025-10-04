# Finanças Pessoais PRO

API REST construída com Spring Boot para gestão de finanças pessoais. Inclui autenticação JWT, controle de contas, categorias, transações (incluindo transferências internas), regras recorrentes com agendamento automático, budgets mensais e relatórios consolidados.

## Tecnologias
- Java 21
- Spring Boot 3 (Web, Data JPA, Security, Validation, Scheduling)
- PostgreSQL + Flyway
- JWT (io.jsonwebtoken)
- MapStruct
- Springdoc OpenAPI
- Testcontainers
- Docker Compose

## Como executar
1. **Configurar variáveis** (opcional): copie `src/main/resources/application.yml` e ajuste credenciais.
2. **Executar localmente**:
   ```bash
   ./mvnw spring-boot:run
   ```
3. **Via Docker Compose**:
   ```bash
   docker-compose up --build
   ```

A documentação Swagger estará disponível em `http://localhost:8080/swagger-ui.html`.

Credenciais seed: `demo@financas.dev` / `Password123!`.

## Testes
Os testes de integração utilizam Testcontainers (PostgreSQL). Para executá-los:
```bash
./mvnw test
```

## Estrutura de pastas
A estrutura segue a organização solicitada, com pacotes dedicados para configuração, autenticação, domínio, serviços, controllers web, mapeadores MapStruct, relatórios e agendadores.
