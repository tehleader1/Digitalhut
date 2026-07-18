# DigitalHut Social Operations hosting

This package hosts the private Mixpost control plane at `https://social.digitalhut.app`. It is not a Vercel function and does not share DigitalHut's Supabase, provider, payment, or audience credentials.

## Production boundary

- A Linux VPS with Docker Compose is required.
- DNS `A` record: `social.digitalhut.app` -> the VPS IPv4 address.
- Only ports 22, 80, and 443 are public. MySQL and Redis have no host ports.
- Caddy obtains and renews TLS certificates after DNS resolves.
- `.env` contains production secrets and must never be committed.
- Automatic social publishing remains disabled until accounts, scopes, approvals, duplicate protection, and pause controls are reviewed.

## First launch

1. Copy `.env.example` to `.env` on the server.
2. Replace every generated placeholder with an independent cryptographically random value.
3. Run `docker compose config` and inspect the rendered service boundaries.
4. Run `docker compose up -d`.
5. Verify `docker compose ps`, the HTTPS login page, queue worker logs, and database health.
6. Replace the installer default account immediately with `developer-anthony@digitalhut.app` and a password stored in the owner's password manager.

## Backup minimum

Back up the MySQL database and `mixpost_media` volume separately. Test restoration before connecting production social accounts. A database dump alone does not preserve uploaded media.
