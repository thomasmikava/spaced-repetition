#!/usr/bin/env bash
set -euo pipefail
cd "$(node -p 'require("path").dirname(require("fs").realpathSync(process.argv[1]))' "$0")"
host=ubuntu-spaced-repetition
if [[ ${1:-} == --rollback ]]; then
  release=${2:?Usage: --rollback RELEASE_ID}
  [[ "$release" =~ ^[0-9]{8}T[0-9]{6}Z-[a-f0-9]{7,12}(-dirty)?$ ]] || exit 2
  ssh "$host" bash /var/www/memoriko/scripts/activate-frontend.sh "$release"
  exit
fi
[[ $# == 0 ]] || { echo 'Usage: deploy-frontend.command [--rollback RELEASE_ID]' >&2; exit 2; }
yarn install --frozen-lockfile --non-interactive
yarn build
release="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short=12 HEAD)"
[[ -z $(git status --porcelain) ]] || release="$release-dirty"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cp -R dist "$tmp/site"
node scripts/release-manifest.cjs "$tmp/site/release.json" "$release"
COPYFILE_DISABLE=1 tar --no-xattrs -czf "$tmp/release.tar.gz" -C "$tmp/site" .
(cd "$tmp" && shasum -a 256 release.tar.gz > artifact.sha256)
ssh "$host" "mkdir -p /var/www/memoriko/releases/$release /var/www/memoriko/scripts"
scp scripts/activate-frontend.sh "$host:/var/www/memoriko/scripts/activate-frontend.sh"
scp "$tmp/release.tar.gz" "$tmp/artifact.sha256" "$host:/var/www/memoriko/releases/$release/"
ssh "$host" "cd /var/www/memoriko/releases/$release && sha256sum -c artifact.sha256 && tar --no-same-owner -xzf release.tar.gz && bash /var/www/memoriko/scripts/activate-frontend.sh $release"
