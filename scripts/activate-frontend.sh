#!/usr/bin/env bash
set -euo pipefail
release=${1:?Release required}
[[ "$release" =~ ^[0-9]{8}T[0-9]{6}Z-[a-f0-9]{7,12}(-dirty)?$ ]] || exit 2
root=/var/www/memoriko
target="$root/releases/$release"
[[ -f "$target/index.html" && -f "$target/release.json" ]] || exit 2
curl --fail --silent --max-time 5 http://127.0.0.1:5567/api/health/ready >/dev/null
previous=$(readlink "$root/current" || true)
if [[ -n "$previous" && "$previous" != "$target" && -d "$previous/assets" ]]; then
  mkdir -p "$target/assets"
  cp -n "$previous"/assets/* "$target/assets/"
fi
ln -s "$target" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
if ! curl --fail --silent --max-time 10 https://memoriko.com/ >/dev/null; then
  if [[ -n "$previous" ]]; then
    ln -s "$previous" "$root/current.rollback"
    mv -Tf "$root/current.rollback" "$root/current"
  fi
  echo 'Frontend health check failed; restored preceding release.' >&2
  exit 1
fi
echo "Frontend active: $release"
