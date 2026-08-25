#!/bin/sh
set -e

PRISMA="/opt/prisma/node_modules/.bin/prisma"
SCHEMA="/app/prisma/schema.prisma"

echo "→ applying migrations"
"$PRISMA" migrate deploy --schema="$SCHEMA"

# Seed only a genuinely empty catalogue, so restarts and redeploys never
# clobber edits made in the dashboard.
if [ "${SEED_ON_START:-auto}" != "off" ]; then
  COUNT=$(node -e '
    const { createRequire } = require("node:module");
    const req = createRequire("/app/");
    const { PrismaClient } = req("/app/src/generated/prisma");
    const p = new PrismaClient();
    p.product.count()
      .then((n) => { console.log(n); return p.$disconnect(); })
      .catch(() => { console.log(-1); process.exit(0); });
  ' 2>/dev/null || echo -1)

  if [ "$COUNT" = "0" ]; then
    echo "→ empty catalogue, seeding"
    node /app/prisma/seed.mjs || echo "  seed failed, continuing"
  else
    echo "→ catalogue has $COUNT products, not seeding"
  fi
fi

echo "→ starting"
exec "$@"
