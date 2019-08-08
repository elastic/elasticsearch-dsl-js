#!/bin/bash

exec docker run \
  --rm \
  -e "discovery.type=single-node" \
  -p 9200:9200 \
  docker.elastic.co/elasticsearch/elasticsearch:7.3.0
