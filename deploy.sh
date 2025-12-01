#!/usr/bin/env sh

# Abort on errors
set -e

# Build the site
npm run docs:build

# Navigate into the build output directory
cd .vitepress/dist

# Create a .nojekyll file to prevent GitHub Pages from running Jekyll
touch .nojekyll

git init
git add -A
git commit -m 'deploy'

# Deploy to https://<USERNAME>.github.io
# In this case, https://zeehu.github.io
# The script pushes to the 'gh-pages' branch
git push -f git@github.com:zeehu/zeehu.github.io.git main:gh-pages

cd -
