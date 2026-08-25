#!/usr/bin/env bash
#
# Runs ON THE SERVER, fed to `bash -s` over SSH by .github/workflows/deploy.yml.
# Kept in the repo rather than inlined in the workflow so it can be read,
# linted and run by hand:
#
#   APP_IMAGE=ghcr.io/abdumurad/lirisha:sha-<sha> bash docker/release.sh
#
# Inputs (environment):
#   APP_IMAGE  required — the exact tag to run. Never `latest`: two deploys of
#              a moving tag are indistinguishable, and rolling back to one is
#              guesswork.
#   RESEED     optional — "true" wipes every product and reseeds. Destructive,
#              so it is never part of an ordinary deploy.
#   GIT_SHA    optional — sync the checkout at APP_DIR to this commit first, so
#              docker-compose.yml matches the image being deployed. Skipped if
#              the tree has local edits.
#   APP_DIR    optional — defaults to /opt/lirisha.
#   COMPOSE_PROFILE
#              optional — defaults to "edge" (the Caddy TLS terminator). Set it
#              empty to exercise this script without binding 80/443, which is
#              how it gets tested off the server.
#
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/lirisha}"
RESEED="${RESEED:-false}"
COMPOSE_PROFILE="${COMPOSE_PROFILE-edge}"
: "${APP_IMAGE:?APP_IMAGE is required}"

cd "$APP_DIR"

compose() {
  if [ -n "$COMPOSE_PROFILE" ]; then
    docker compose --profile "$COMPOSE_PROFILE" "$@"
  else
    docker compose "$@"
  fi
}

# The container id, not a guessed name — the compose project name is set in
# docker-compose.yml and renaming it should not silently break the deploy.
app_container() { compose ps -q app 2>/dev/null || true; }

running_image() {
  local id
  id="$(app_container)"
  [ -n "$id" ] || return 0
  docker inspect --format '{{.Config.Image}}' "$id" 2>/dev/null || true
}

# Compose declares start_period 40s with 3×30s retries, so a slow-but-fine boot
# can legitimately take ~130s to flip to healthy. Budget past that, and exit
# early the moment it reports unhealthy rather than burning the full window.
wait_healthy() {
  local id state
  for _ in $(seq 1 90); do
    id="$(app_container)"
    if [ -n "$id" ]; then
      state="$(docker inspect --format '{{.State.Health.Status}}' "$id" 2>/dev/null || echo starting)"
      [ "$state" = healthy ] && return 0
      [ "$state" = unhealthy ] && return 1
    fi
    sleep 2
  done
  return 1
}

# APP_IMAGE from this shell takes precedence over the .env default, so the box
# runs precisely the tag the workflow built. --no-build guarantees the compose
# file's build: section is never honoured on the server.
up() { APP_IMAGE="$1" compose up -d --no-build --remove-orphans; }

# The image is only half a release: docker-compose.yml is deployment config too,
# and a healthcheck or profile change would otherwise sit in the repo forever
# while the box ran last year's copy. Sync the checkout to the same commit the
# image was built from — but never over the top of local edits. The README tells
# you to comment out the `ports:` block on a public server; silently reverting
# that would republish the app on :3000, so a dirty tree warns and is left alone.
sync_checkout() {
  [ -n "${GIT_SHA:-}" ] || return 0
  if [ ! -d .git ]; then
    echo "note: $APP_DIR is not a git checkout — compose config left as-is" >&2
    return 0
  fi
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "WARNING: $APP_DIR has local modifications — compose config left as-is." >&2
    echo "         Reconcile these by hand if the deploy depends on a config change:" >&2
    git status --short >&2
    return 0
  fi
  git fetch --quiet origin "$GIT_SHA" 2>/dev/null || git fetch --quiet origin
  git checkout --quiet --detach "$GIT_SHA"
  echo "config  : synced to $GIT_SHA"
}

sync_checkout

PREVIOUS="$(running_image)"
echo "current : ${PREVIOUS:-<none>}"
echo "incoming: $APP_IMAGE"

docker pull -q "$APP_IMAGE"
up "$APP_IMAGE"

if ! wait_healthy; then
  echo "new container did not become healthy" >&2
  compose logs --tail 80 app || true
  if [ -n "$PREVIOUS" ] && [ "$PREVIOUS" != "$APP_IMAGE" ]; then
    echo "rolling back to $PREVIOUS" >&2
    up "$PREVIOUS"
    if wait_healthy; then
      echo "rollback ok — the shop is serving the previous build" >&2
    else
      echo "rollback also unhealthy — the shop is DOWN" >&2
    fi
  else
    echo "no previous image to roll back to" >&2
  fi
  exit 1
fi

echo "deployed $APP_IMAGE"

if [ "$RESEED" = "true" ]; then
  echo "reseeding the catalogue (every product and product image is replaced)"
  compose exec -T app node prisma/seed.mjs
fi

# Keep what is running and what it replaced; drop the rest. Anything still
# referenced by a container refuses to go, which is exactly the behaviour we
# want — so failures here are ignored rather than guarded against.
# Shortest suffix match, so only the :tag comes off. `%%:*` would strip from
# the FIRST colon — harmless against ghcr.io/owner/repo:tag, but on any
# registry carrying a port (host:5000/repo:tag) it leaves "host", the filter
# matches nothing, and pruning quietly stops happening until the disk fills.
REPO="${APP_IMAGE%:*}"
docker images --filter=reference="$REPO" --format '{{.Repository}}:{{.Tag}}' \
  | grep -v ':latest$' \
  | grep -Fxv "$APP_IMAGE" \
  | grep -Fxv "${PREVIOUS:-__no_previous__}" \
  | xargs -r -n1 docker rmi >/dev/null 2>&1 || true

echo "done"
