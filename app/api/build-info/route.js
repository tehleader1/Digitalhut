export const dynamic = "force-dynamic"

const release = "render-production-deploy-2026-06-06"

function env(name) {
  return process.env[name] || null
}

export async function GET() {
  const render = {
    serviceName: env("RENDER_SERVICE_NAME"),
    serviceId: env("RENDER_SERVICE_ID"),
    instanceId: env("RENDER_INSTANCE_ID"),
    gitCommit: env("RENDER_GIT_COMMIT"),
    externalHostname: env("RENDER_EXTERNAL_HOSTNAME")
  }

  const github = {
    sha: env("GITHUB_SHA"),
    ref: env("GITHUB_REF")
  }

  const vercel = {
    commitSha: env("VERCEL_GIT_COMMIT_SHA"),
    env: env("VERCEL_ENV")
  }

  return Response.json({
    ok: true,
    release,
    host: render.serviceName ? "render" : vercel.env ? "vercel" : "unknown",
    nodeEnv: env("NODE_ENV"),
    port: env("PORT"),
    render,
    github,
    vercel,
    checkedAt: new Date().toISOString()
  })
}
