#!/usr/bin/env bash

systemctl stop getyour.service
rm -f /opt/getyour/app.js
rm -f /opt/getyour/package.json
rm -rf /opt/getyour/agents
rm -rf /opt/getyour/html
rm -rf /opt/getyour/static
cd /opt
git clone https://github.com/pana87/getyour-platform temp
mv temp/app.js /opt/getyour/app.js
mv temp/package.json /opt/getyour/package.json
mv temp/agents /opt/getyour/agents
mv temp/html /opt/getyour/html
mv temp/static /opt/getyour/static
rm -rf temp
systemctl start getyour.service
