process.env.NODE_ENV = "test";
process.env.PORT = "3000";
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? "test-secret-key-1234567890-test-secret-key";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://root:root@localhost:5432/portfolio_test";
process.env.ALLOWED_ORIGINS =
  process.env.ALLOWED_ORIGINS ?? '["http://localhost:5173", "http://test.com"]';
process.env.DB_HOST = process.env.DB_HOST ?? "localhost";
process.env.DB_PORT = process.env.DB_PORT ?? "5432";
process.env.DB_USERNAME = process.env.DB_USERNAME ?? "root";
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? "root";
process.env.DB_NAME = process.env.DB_NAME ?? "portfolio_test";
