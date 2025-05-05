#!/usr/bin/env bash

if [ -z "$1" ] || [ ! -d "$1" ]; then
  echo "Usage: $0 <directory>"
  echo "Error: $1 is not a valid directory"
  exit 1
fi

dir="$1"

find "$dir" -type f -exec chmod 600 {} \;
