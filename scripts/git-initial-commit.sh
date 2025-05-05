#!/usr/bin/env bash

# Überprüfen, ob ein Parameter übergeben wurde
if [ -z "$1" ]; then
  echo "Fehler: Kein Branch-Name angegeben."
  echo "Verwendung: $0 branch-name"
  exit 1
fi

#Überprüfen, ob eine Versionsnumer angegeben wurde
if [ -z "$2" ]; then 
  echo "Warnung: Keine Versionsnummer angegeben. Kein Tag wird erstellt."
else 
  Version=$2 
fi

# Parameter zuweisen
BRANCH_NAME=$1 

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

# Tag erstellen, wenn eine Versionsnummer angegeben wurde
if [ ! -z "$VERSION" ]; then
  git tag -a "$VERSION" -m "RELEASE $VERSION"
  git push origin "$VERSION"
fi

git branch
git status
