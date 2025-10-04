CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH new_user AS (
    INSERT INTO users (id, name, email, password, created_at)
    VALUES (uuid_generate_v4(), 'Demo User', 'demo@financas.dev', crypt('Password123!', gen_salt('bf')), now())
    RETURNING id
),
roles AS (
    INSERT INTO user_roles (user_id, role)
    SELECT id, 'ROLE_USER' FROM new_user
),
account_a AS (
    INSERT INTO accounts (id, user_id, name, account_type, initial_balance, created_at)
    SELECT uuid_generate_v4(), id, 'Conta Corrente', 'CHECKING', 2500.00, now() FROM new_user
    RETURNING id, user_id
),
account_b AS (
    INSERT INTO accounts (id, user_id, name, account_type, initial_balance, created_at)
    SELECT uuid_generate_v4(), id, 'Carteira', 'WALLET', 200.00, now() FROM new_user
    RETURNING id, user_id
),
income_cat AS (
    INSERT INTO categories (id, user_id, name, kind, color, created_at)
    SELECT uuid_generate_v4(), id, 'Salário', 'INCOME', '#4caf50', now() FROM new_user
    RETURNING id, user_id
),
expense_cat AS (
    INSERT INTO categories (id, user_id, name, kind, color, created_at)
    SELECT uuid_generate_v4(), id, 'Supermercado', 'EXPENSE', '#ff5722', now() FROM new_user
    RETURNING id, user_id
),
transactions_seed AS (
    INSERT INTO transactions (id, user_id, account_id, category_id, type, amount, description, occurred_at, created_at)
    SELECT uuid_generate_v4(), iu.id, aa.id, ic.id, 'IN', 5000.00, 'Salário Mensal', now() - interval '5 days', now()
    FROM new_user iu
    JOIN account_a aa ON iu.id = aa.user_id
    JOIN income_cat ic ON iu.id = ic.user_id
    UNION ALL
    SELECT uuid_generate_v4(), iu.id, aa.id, ec.id, 'OUT', 320.45, 'Compras do mês', now() - interval '3 days', now()
    FROM new_user iu
    JOIN account_a aa ON iu.id = aa.user_id
    JOIN expense_cat ec ON iu.id = ec.user_id
),
budget_seed AS (
    INSERT INTO budgets (id, user_id, category_id, month, amount, created_at)
    SELECT uuid_generate_v4(), iu.id, ec.id, date_trunc('month', now())::date, 1200.00, now()
    FROM new_user iu
    JOIN expense_cat ec ON iu.id = ec.user_id
)
SELECT 1;
