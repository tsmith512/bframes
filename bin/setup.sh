#!/bin/bash

mkdir -p static/vendor/mermaid
curl https://registry.npmjs.org/mermaid/-/mermaid-10.6.1.tgz -o mermaid.tgz
tar -zxf mermaid.tgz -C static/vendor/mermaid

cd static/stream-pricing
nvm use
npm install
npm run build
mv $(find build/static/js -iname *.js | head) ../pricing-calculator.js

cd ../..
rm -rf static/stream-pricing/node_modules

hugo
