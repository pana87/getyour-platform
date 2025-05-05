#!/usr/bin/env bash

git branch | grep -v 'main' | xargs git branch -D
