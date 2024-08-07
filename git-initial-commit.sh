#!/bin/bash

# Überprüfen, ob ein Parameter übergeben wurde
if [ -z "$1" ]; then
  echo "Fehler: Kein Branch-Name angegeben."
  echo "Verwendung: $0 branch-name"
  exit 1
fi

# Parameter zuweisen
BRANCH_NAME=$1

# Befehle ausführen
npm run close
git checkout -b "$BRANCH_NAME"
git add .
git commit -m "$BRANCH_NAME"
git push --set-upstream origin "$BRANCH_NAME"
