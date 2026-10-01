import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and set a value.`
    );
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV?.trim() || "development";
const portRaw = process.env.PORT?.trim();
const port = portRaw ? Number(portRaw) : 5000;

if (Number.isNaN(port) || port <= 0) {
  throw new Error("PORT must be a positive number.");
}

export const env = {
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseAnonKey: requireEnv("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  port,
  nodeEnv,
  isProduction: nodeEnv === "production",
} as const;
