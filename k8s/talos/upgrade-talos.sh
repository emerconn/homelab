#! /usr/bin/bash

# update this version
TALOS_VERSION="1.12.4"

IMAGE="factory.talos.dev/metal-installer/0b4f48281e59712995bea152e8e62f3082be4ab66d2bdd0ca83cb3ce8c4509a9:v$TALOS_VERSION"
NODES=(cp-01 cp-02 cp-03 w-01)

for node in "${NODES[@]}"; do
  echo "Upgrading $node..."
  talosctl upgrade -i "$IMAGE" -n "$node" || {
    echo "Upgrade Talos to $TALOS_VERSION failed for $node" >&2
  }
done
