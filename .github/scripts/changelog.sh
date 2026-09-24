#!/usr/bin/env bash
# Usage: changelog.sh <from-tag> <version>. Prints the CHANGELOG section for
# <version>: every commit since <from-tag>, grouped by its conventional type.
set -euo pipefail

from=$1
version=$2
repo=https://github.com/manuartero/libro-viajero.app

subjects=$(git log --no-merges --format=%s "$from..HEAD" | grep -v '^chore(release)' || true)

group() {
  local title=$1 lines
  shift
  lines=$(printf '%s\n' "$subjects" | grep "$@" || true)
  if [ -z "$lines" ]; then
    return
  fi
  printf '\n### %s\n\n' "$title"
  printf '%s\n' "$lines" | sed -E \
    -e 's/^[a-z]+(\([^)]*\))?!?: //' \
    -e "s|\(#([0-9]+)\)$|([#\1]($repo/pull/\1))|" \
    -e 's/^/- /'
}

printf '## [%s](%s/compare/%s...v%s) — %s\n' "$version" "$repo" "$from" "$version" "$(date +%F)"
group Features -E '^feat(\(|!|:)'
group Fixes -E '^fix(\(|!|:)'
group Style -E '^style(\(|!|:)'
group Chores -vE '^$|^(feat|fix|style)(\(|!|:)'
