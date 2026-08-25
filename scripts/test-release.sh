#!/usr/bin/env bash
#
# Exercises docker/release.sh — the half of the deploy that runs on the server —
# without touching the server.
#
#   bash scripts/test-release.sh
#
# It stands up a throwaway registry on :5001, pushes three stand-in images that
# honour the same /api/health contract as the real one (a good build, a second
# good build, and one that boots but never becomes healthy), and drives the
# release through: cold start → rolling upgrade → failed deploy → rollback.
#
# Worth having because deploy logic is otherwise only testable in production,
# and the failure path — the one that matters — is the one you least want to
# discover live. This harness is what caught `${APP_IMAGE%%:*}` stripping a
# registry port and silently disabling image pruning.
#
# Requires docker. Leaves nothing behind.
set -euo pipefail

cd "$(dirname "$0")/.."

command -v docker >/dev/null || { echo "docker is required"; exit 1; }
docker info >/dev/null 2>&1 || { echo "the docker daemon is not reachable"; exit 1; }

REG_PORT=5001
REG="localhost:${REG_PORT}"
REPO="${REG}/lirisha-releasetest"
PROJECT="lirisha-releasetest"
WORK="$(mktemp -d)"
APP_PORT=3998

pass=0; fail=0
chk() {
  if [ "$2" = "$3" ]; then
    printf 'PASS  %s\n' "$1"; pass=$((pass + 1))
  else
    printf 'FAIL  %s — expected %q, got %q\n' "$1" "$3" "$2"; fail=$((fail + 1))
  fi
}

cleanup() {
  ( cd "$WORK" 2>/dev/null && docker compose down -v >/dev/null 2>&1 ) || true
  docker rm -f "$PROJECT-registry" >/dev/null 2>&1 || true
  docker images --filter=reference="$REPO" --format '{{.Repository}}:{{.Tag}}' \
    | xargs -r -n1 docker rmi -f >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

echo "workspace: $WORK"

# The compose project is renamed so a run here can never collide with a real
# `lirisha` stack on the same machine.
sed 's/^name: lirisha$/name: '"$PROJECT"'/' docker-compose.yml > "$WORK/docker-compose.yml"
cp docker/release.sh "$WORK/release.sh"

cat > "$WORK/.env" <<EOF
ADMIN_PASSWORD=release-test
AUTH_SECRET=release-test-secret-long-enough
NEXT_PUBLIC_SITE_URL=https://example.test
APP_PORT=${APP_PORT}
DOMAIN=example.test
EOF

# A stand-in has to satisfy compose's healthcheck, which shells out to curl —
# hence the shim. The broken one starts and stays up but never serves, which is
# how a real bad build fails: migrate throws, the process lingers, health never
# flips.
cat > "$WORK/Dockerfile.good" <<'EOF'
FROM busybox:latest
RUN mkdir -p /www/api && printf 'ok' > /www/api/health \
 && printf '#!/bin/sh\nshift $(($#-1))\nexec wget -qO- "$1"\n' > /usr/bin/curl \
 && chmod +x /usr/bin/curl
CMD ["httpd","-f","-p","3000","-h","/www"]
EOF

cat > "$WORK/Dockerfile.bad" <<'EOF'
FROM busybox:latest
RUN printf '#!/bin/sh\nshift $(($#-1))\nexec wget -qO- "$1"\n' > /usr/bin/curl && chmod +x /usr/bin/curl
CMD ["sh","-c","echo 'boot failed: prisma migrate deploy could not open /data/lirisha.db'; sleep 3600"]
EOF

echo "starting a throwaway registry on :${REG_PORT}"
docker rm -f "$PROJECT-registry" >/dev/null 2>&1 || true
docker run -d --name "$PROJECT-registry" -p "${REG_PORT}:5000" registry:2 >/dev/null
for _ in $(seq 1 20); do
  curl -fsS "http://${REG}/v2/" >/dev/null 2>&1 && break
  sleep 1
done

build_push() { # <dockerfile> <tag>
  docker build -q -f "$WORK/$1" -t "$REPO:$2" "$WORK" >/dev/null
  docker push -q "$REPO:$2" >/dev/null
}
build_push Dockerfile.good good-1
build_push Dockerfile.good good-2
build_push Dockerfile.bad  broken

# Drop the local copies so the release genuinely pulls, as it will on the box.
docker rmi -f "$REPO:good-1" "$REPO:good-2" "$REPO:broken" >/dev/null 2>&1 || true

release() { # <tag> → stdout captured, exit code in $rc
  set +e
  out="$(cd "$WORK" && APP_DIR="$WORK" COMPOSE_PROFILE='' APP_IMAGE="$REPO:$1" bash release.sh 2>&1)"
  rc=$?
  set -e
}

running_image() {
  local id
  id="$(cd "$WORK" && { docker compose ps -q app 2>/dev/null || true; })"
  if [ -n "$id" ]; then
    docker inspect --format '{{.Config.Image}}' "$id" 2>/dev/null || echo "<none>"
  else
    echo "<none>"
  fi
}

echo
echo "── 1 · cold start ─────────────────────────────────────────"
release good-1
chk "exits 0"                "$rc" "0"
chk "reports the tag"        "$(printf '%s' "$out" | grep -c "deployed $REPO:good-1")" "1"
chk "serves /api/health"     "$(curl -s "http://localhost:${APP_PORT}/api/health")" "ok"

echo
echo "── 2 · rolling upgrade ────────────────────────────────────"
release good-2
chk "exits 0"                "$rc" "0"
chk "saw the old tag"        "$(printf '%s' "$out" | grep -c "current : $REPO:good-1")" "1"
chk "now running the new one" "$(running_image)" "$REPO:good-2"
chk "never stopped serving"  "$(curl -s "http://localhost:${APP_PORT}/api/health")" "ok"

echo
echo "── 3 · a build that never becomes healthy ─────────────────"
start=$(date +%s)
release broken
took=$(( $(date +%s) - start ))
chk "exits non-zero"         "$([ "$rc" -ne 0 ] && echo yes || echo no)" "yes"
chk "surfaces the container's error" \
    "$(printf '%s' "$out" | grep -c 'prisma migrate deploy could not open')" "1"
chk "rolls back"             "$(printf '%s' "$out" | grep -c "rolling back to $REPO:good-2")" "1"
chk "rollback succeeds"      "$(printf '%s' "$out" | grep -c 'rollback ok')" "1"
chk "previous build restored" "$(running_image)" "$REPO:good-2"
chk "shop stayed up"         "$(curl -s "http://localhost:${APP_PORT}/api/health")" "ok"
echo "     (detected and recovered in ${took}s)"

echo
echo "── 4 · pruning keeps current + previous ───────────────────"
build_push Dockerfile.good good-3
release good-3
kept="$(docker images --filter=reference="$REPO" --format '{{.Tag}}' | sort | tr '\n' ' ' | sed 's/ $//')"
chk "keeps exactly current and previous" "$kept" "good-2 good-3"

echo
echo "══ $pass passed, $fail failed ══"
[ "$fail" -eq 0 ]
