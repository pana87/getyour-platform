#!/bin/bash
git checkout main
git fetch
git merge
git branch | grep -v 'main' | xargs git branch -D
git branch
git status
npm run dev
