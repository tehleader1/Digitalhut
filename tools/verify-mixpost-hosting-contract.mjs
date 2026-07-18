import assert from "node:assert/strict"
import fs from "node:fs"

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
const compose = read("ops/mixpost/compose.yaml")
const caddy = read("ops/mixpost/Caddyfile")
const example = read("ops/mixpost/.env.example")
let checks = 0
const ok = (value, message) => { assert.ok(value, message); checks += 1 }

for(const service of ["caddy:", "mixpost:", "mysql:", "redis:"]) ok(compose.includes(service), `missing ${service}`)
ok(/inovector\/mixpost@sha256:[a-f0-9]{64}/.test(compose), "Mixpost image digest must be pinned")
ok(!/mysql:[\s\S]{0,500}\n\s+ports:/.test(compose), "MySQL cannot expose host ports")
ok(!/redis:[\s\S]{0,400}\n\s+ports:/.test(compose), "Redis cannot expose host ports")
ok(/social:\n\s+internal: true/.test(compose), "service network must be internal")
ok(compose.includes("APP_URL: https://${SOCIAL_HOST}"), "public URL must use HTTPS host")
ok(compose.includes("APP_DEBUG: \"false\""), "production debug must be off")
ok(compose.includes("REDIS_PASSWORD: ${REDIS_PASSWORD}"), "Redis password required")
ok(compose.includes("restart: unless-stopped"), "services require restart policy")
ok(compose.includes("mysql_data:/var/lib/mysql"), "MySQL persistence required")
ok(compose.includes("mixpost_media:/var/www/html/storage/app/public"), "media persistence required")
ok(caddy.includes("Strict-Transport-Security"), "HSTS required")
ok(caddy.includes("reverse_proxy mixpost:80"), "Caddy must proxy only Mixpost")
ok(example.includes("SOCIAL_HOST=social.digitalhut.app"), "exact social host required")
ok(!example.split(/\r?\n/).some((line) => {
  const value = line.split("=").slice(1).join("=")
  return value && !value.startsWith("GENERATE_") && /^[A-Za-z0-9_+\/-]{24,}$/.test(value)
}), "example file cannot contain live-looking secrets")

console.log(JSON.stringify({ok:true, checks, publicHost:"social.digitalhut.app", mysqlPublic:false, redisPublic:false, automaticPublishingActivated:false}, null, 2))
