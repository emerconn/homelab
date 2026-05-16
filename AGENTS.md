# AGENTS.md

GitOps homelab: Talos Linux bare-metal Kubernetes cluster managed by Flux CD, with SOPS-encrypted secrets and Cloudflare Workers.

## Repository layout

- `k8s/flux/` — Flux CD resources (the main operational content)
  - `clusters/tal-clu-1/` — cluster entrypoint; Flux syncs this path from `main`
    - `flux-system/` — Flux operator + instance definition
    - `infra/` — infrastructure components (network, observe, secrets, security, storage, util)
    - `apps/` — user-facing apps (minecraft, valheim, 7dtd-server)
  - `infra/` — shared reusable Flux infra definitions (HelmRepository, Kustomization sources)
- `k8s/talos/` — Talos OS machine configs, patches, and upgrade scripts
  - `machine-config/` — base configs (`cp.yaml`, `w.yaml`) and node-specific patches
- `cloudflare/workers/` — Cloudflare Workers (e.g. DDNS)
- `docs/` — mdBook source for GitHub Pages documentation site

## Key conventions

- **Flux is the deployment mechanism.** Changes to `k8s/flux/**` on `main` trigger a GitHub Action that reconciles Flux via Tailscale. There is no local `kubectl apply` workflow for Flux-managed resources.
- **SOPS + age** encrypts K8s secrets at rest. Config is in `.sops.yaml` — it targets files matching `secret-sops.*.yaml` and encrypts only `data`/`stringData` fields. The age public key is in `.sops.yaml`; the private key is stored in-cluster as `secret/sops-age` in `flux-system` namespace.
- **Not Flux-managed** (applied manually or via Talos): metrics-server, kubelet-serving-cert-approver, Cilium (CNI must exist before Flux can run). See `k8s/flux/README.md`.
- **Renovate** runs as a GitHub App (not the workflow in `.github/workflows/renovate.yaml`, which is unused). Config is `.github/renovate.json5`.
- **Talos factory image** Renovate updates are disabled for `factory.talos.dev/installer` packages (see `renovate.json5`).

## Working with secrets

```bash
# Edit an existing SOPS-encrypted secret
sops k8s/flux/clusters/tal-clu-1/flux-system/secret-sops-*.yaml

# Encrypt a new secret file (must match naming pattern secret-sops.*.yaml)
sops --encrypt --in-place k8s/flux/.../secret-sops-mysecret.yaml
```

Requires the SOPS age private key in the environment or configured locally.

## Flux reconciliation

```bash
# Force full reconcile from CLI (requires kubeconfig + flux CLI)
flux reconcile kustomization flux-system --with-source

# Force reconcile source then kustomization (what the CI workflow does)
flux reconcile source git flux-system --timeout "15s"
flux reconcile kustomization flux-system --timeout "30s"
```

## Talos operations

```bash
# Patch machine config on all nodes
talosctl patch mc \
  --nodes cp-01.tal-clu-1.hl.emerconn.com,cp-02.tal-clu-1.hl.emerconn.com,cp-03.tal-clu-1.hl.emerconn.com,w-01.tal-clu-1.hl.emerconn.com \
  --patch @all.yaml

# Upgrade Talos OS (sequential, control plane first)
# See k8s/talos/upgrade-talos.sh

# Upgrade Kubernetes via Talos
# See k8s/talos/upgrade-k8s.sh
```

## CI

- **Flux workflow** (`.github/workflows/flux.yaml`): triggers on push to `main` touching `k8s/flux/**`. Connects via Tailscale to the cluster and reconciles Flux.
- **GitHub Pages** (`.github/workflows/github-pages.yaml`): builds `docs/` with mdBook on changes to `docs/**` or `README.md`.

## Gotchas

- `kubeconfig` and `talosconfig` are gitignored — they are generated per-environment, not committed.
- SOPS decrypted files (`.decrypted~*`) and age key files (`*.agekey`) are gitignored.
- Cilium is deployed via helm post-bootstrap, not via Talos or Flux — it lives in `k8s/talos/cilium/`.
- CoreDNS is deployed post-bootstrap — it lives in `k8s/talos/coredns/`.
- Flux operator itself is deployed post-bootstrap — it lives in `k8s/talos/flux/`.
- The cluster name is `tal-clu-1`. Node FQDNs follow `<hostname>.tal-clu-1.hl.emerconn.com`.
- Worker node (w-01) has 64GB RAM and no additional storage disk; control plane nodes (cp-01/02/03) each have a 2TB SSD for Rook Ceph.
