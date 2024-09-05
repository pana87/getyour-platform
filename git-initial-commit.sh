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

#Überprüfung, ob bereits Dateien vorhanden sind
if [ $(git ls-flies | wc -1) -eq 0]; then
  echo "Erstelle eine initiale README.md"
  echo "#PROJEKT $BRANCH_NAME" > README.md
  git add README.md
fi 

# Befehle ausführen
git checkout -b "$BRANCH_NAME"
git add .
git commit -m "$BRANCH_NAME"
git push --set-upstream origin "$BRANCH_NAME"
git tag -a "v1.0.0" -m 
git push origin "v1.0.0"
git branch
git status
