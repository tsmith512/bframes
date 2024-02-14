#!/bin/bash

mkdir -p static/vendor/mermaid
curl https://registry.npmjs.org/mermaid/-/mermaid-10.6.1.tgz -o mermaid.tgz
tar -zxf mermaid.tgz -C static/vendor/mermaid

hugo
