#! /usr/bin/bash

K8S_VERSION="1.35.1"

talosctl upgrade-k8s -n cp-01 --to "$K8S_VERSION" || {
  echo "Upgrade Kubernetes to $K8S_VERSION failed" >&2
}
