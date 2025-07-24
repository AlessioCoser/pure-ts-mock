#!/bin/bash
set -e

if [[ "$1" != "major" && "$1" != "minor" && "$1" != "patch" ]]; then
  echo "Usage: $0 [major|minor|patch]"
  exit 1
fi

# Bump version
npm version $1 --no-git-tag-version

# Get new version
VERSION=$(node -p "require('./package.json').version")

# Update lockfile
pnpm install

# Commit changes
git add package.json pnpm-lock.yaml
# TODO update the readme documentation with the latest version
git commit -m "chore(release): v$VERSION"

# Create tag
git tag "v$VERSION"

# Push commit and tag
git push origin main --tags
