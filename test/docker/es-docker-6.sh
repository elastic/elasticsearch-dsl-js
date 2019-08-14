#!/bin/bash

exec docker run \
  --rm \
  -e "path.repo=/tmp" \
  -e "repositories.url.allowed_urls=http://snapshot.*" \
  -e "discovery.type=single-node" \
  -e "cluster.name=docker-cluster-6" \
  -p 9206:9200 \
  docker.elastic.co/elasticsearch/elasticsearch:6.8.2
