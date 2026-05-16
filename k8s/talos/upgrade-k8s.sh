#! /usr/bin/bash

VERSION="1.36.1"

talosctl upgrade-k8s -n cp-01 --to "$VERSION" || {
  echo "K8s $VERSION upgrade failed" >&2
}
