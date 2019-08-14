#!/bin/bash

exec docker run \
  --rm \
  -e "discovery.type=single-node" \
  -e "cluster.name=docker-cluster-7" \
  -p 9207:9200 \
  docker.elastic.co/elasticsearch/elasticsearch:7.3.0
