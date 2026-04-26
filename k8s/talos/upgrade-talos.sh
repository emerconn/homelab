#! /usr/bin/bash

VERSION="1.12.4"
NODES=(cp-01 cp-02 cp-03 w-01)

# 4 extensions
IMAGE="factory.talos.dev/metal-installer/0b4f48281e59712995bea152e8e62f3082be4ab66d2bdd0ca83cb3ce8c4509a9:v$VERSION"

for n in "${NODES[@]}"; do
  echo "Upgrading $n to $VERSION..."
  talosctl upgrade -i "$IMAGE" -n "$n" || {
    echo "Upgrade failed for $n" >&2
  }
done
