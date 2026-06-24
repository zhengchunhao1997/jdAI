import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

loadDotEnv()

export const serverEnv = {
  port: Number(process.env.API_PORT ?? process.env.PORT ?? 4000),
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS),
  defaultMerchantId: process.env.DEFAULT_MERCHANT_ID,
  workerIntervalMs: Number(process.env.WORKER_INTERVAL_MS ?? 3000),
  workerBatchSize: Number(process.env.WORKER_BATCH_SIZE ?? 5),
  cozeSyncEnabled: process.env.COZE_SYNC_ENABLED === "true",
  cozeSyncIntervalMs: Number(process.env.COZE_SYNC_INTERVAL_MS ?? 3 * 60 * 1000),
}

function parseOrigins(value: string | undefined) {
  if (!value) {
    return ["http://localhost:3000"]
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function loadDotEnv() {
  const envPath = join(process.cwd(), ".env")
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const index = trimmed.indexOf("=")
    if (index === -1) continue

    const key = trimmed.slice(0, index)
    const rawValue = trimmed.slice(index + 1)
    if (process.env[key] !== undefined) continue

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "")
  }
}
