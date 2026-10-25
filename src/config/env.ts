import "dotenv/config";

function required(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function parseAllowedOrigins(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim());
    }
    return [String(parsed).trim()];
  } catch {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export const env = {
  PORT: parseInt(process.env.PORT ?? "3000"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  ALLOWED_ORIGINS: parseAllowedOrigins(required("ALLOWED_ORIGINS")),
  JWT_SECRET: required("JWT_SECRET"),

  DB: {
    HOST: required("DB_HOST"),
    PORT: parseInt(process.env.DB_PORT ?? "5432"),
    USERNAME: required("DB_USERNAME"),
    PASSWORD: required("DB_PASSWORD"),
    NAME: required("DB_NAME"),
  },
};
