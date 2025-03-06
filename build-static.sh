#!/usr/bin/env bash

rm -rf ./static
mkdir ./static
cp ./lib/values/home.html ./static/index.html
cp ./lib/values/expert.html ./static/expert.html
cp ./lib/values/admin.html ./static/admin.html
cp ./lib/values/nutzervereinbarung.html ./static/nutzervereinbarung.html
cp ./lib/values/datenschutz.html ./static/datenschutz.html
cp ./lib/values/login.html ./static/login.html
cp ./lib/values/redirect-to-login.html ./static/redirect-to-login.html
cp -a ./client/js ./static
cp -a ./client/public ./static
