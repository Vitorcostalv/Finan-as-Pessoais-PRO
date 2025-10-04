CREATE INDEX idx_transactions_user_occurred_at ON transactions(user_id, occurred_at);
CREATE INDEX idx_budgets_user_month ON budgets(user_id, month);
CREATE UNIQUE INDEX uq_category_name_per_user ON categories(user_id, LOWER(name));
CREATE UNIQUE INDEX uq_users_email ON users(LOWER(email));
