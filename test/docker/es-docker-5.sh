#!/bin/bash

exec docker run \
  --rm \
  -e "path.repo=/tmp" \
  -e "repositories.url.allowed_urls=http://snapshot.*" \
  -e "discovery.zen.ping.unicast.hosts=elasticsearch"  \
  -e "xpack.security.enabled=false" \
  -e "xpack.monitoring.enabled=false" \
  -e "xpack.ml.enabled=false" \
  -e "cluster.name=docker-cluster-5" \
  -p 9205:9200 \
  docker.elastic.co/elasticsearch/elasticsearch:5.6.16
