<div align="center">

  # homelab

  [![flux](https://github.com/emerconn/homelab/actions/workflows/flux.yaml/badge.svg?branch=main)](https://github.com/emerconnelly/homelab/actions/workflows/flux.yaml)
  [![github-pages](https://github.com/emerconn/homelab/actions/workflows/github-pages.yaml/badge.svg)](https://github.com/emerconnelly/homelab/actions/workflows/github-pages.yaml)

  [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/emerconn/homelab)

</div>

# hardware 

### network [![MikroTik Router](https://img.shields.io/badge/RouterOS-555?logo=mikrotik&logoColor=293239&labelColor=fff)](https://mikrotik.homelab.emerconnelly.com/) [![AdGuard Home](https://img.shields.io/badge/AdGuard_Home-555?logo=adguard&logoColor=68bc71&labelColor=000)](https://adguard.homelab.emerconnelly.com/) [![Unifi Network Server](https://img.shields.io/badge/Unifi_Network_Server-555?logo=ubiquiti&logoColor=fff&labelColor=0559c9)](https://unifi.homelab.emerconnelly.com/) 

- MikroTik hAP ax³
  - Containizerd AdGuard Home for DNS
  - WireGuard for secure private access
  - IPSec tunnels for cloud providers
- Unifi Switch Lite 8 PoE

### storage [![Synology DSM](https://img.shields.io/badge/Synology_DSM-555)](https://synology.homelab.emerconnelly.com/)

- Synology DS720+
  - storage: (4) 1TB SATA SSD
  - cache: (2) 256GB NVMe M.2 SD
  - network: (2) 1G ethernet in LAG

### servers 

Refurbed mini-desktop PCs running bare-metal Talos Linux for hosting a Kubernetes cluster

- control plane
  - (3) Dell 9020 Optiplex Micro
    - cpu: [i7-4785T 4-core 3.2GHz 8M](https://www.intel.com/content/www/us/en/products/sku/80814/intel-core-i74785t-processor-8m-cache-up-to-3-20-ghz/specifications.html)
    - ram: [(2x) 8GB DDR3 1600 CL11](https://eu.crucial.com/memory/ddr3/ct102464bf160b)
    - storage:
      - 256GB M.2 SSD <sub>boot</sub>
      - [MX500 2TB SATA SSD](https://www.crucial.com/ssd/mx500/ct2000mx500ssd1) <sub>Rook Ceph</sub>
- workers
  - (1) [Intel NUC10I5FNKN1](https://mitxpc.com/products/bxnuc10i5fnkn1)
    - cpu: [i5-10210U 4-core 4.2GHz 6M](https://www.intel.com/content/www/us/en/products/sku/195436/intel-core-i510210u-processor-6m-cache-up-to-4-20-ghz/specifications.html)
    - ram: [64GB DDR4 2666 CL19](https://semiconductor.samsung.com/us/dram/module/sodimm/m471a4g43mb1-ctd)
    - storage: 256GB M.2 NVMe SSD <sub>boot</sub>

# repo management

### Renovate [![Renovate Dashboard](https://img.shields.io/badge/Dashboard-555?logo=renovate&logoColor=497b9c&labelColor=000)](https://developer.mend.io/github/emerconn/homelab)

- Automated detailed PRs for version upgrades of Flux `HelmRelease`s, container image tags, & K8s `.yaml` resources
- Configured as a [GitHub app](https://github.com/apps/renovate) (migrate to GitHub Action cause it looks cooler?)

### FluxCD

- automatically manage Kubernetes resources as code
- whenever `main` is updated, [this](https://github.com/emerconnelly/homelab/actions/workflows/flux-reconcile.yml) GitHub Action remotely reconciles my cluster by connecting to the K8s API via Tailscale

### SOPS

- encrypts K8s secrets on the client with `age.key`, using the [age](https://github.com/FiloSottile/age) protocol, before commiting them to Git
- Flux decrypts the secrets within the cluster before applying, using a Secret containing `age.key`
- configured via [.sops.yaml](https://github.com/emerconnelly/homelab/blob/main/.sops.yaml) & [gotk-sync.yaml](k8s/flux/clusters/tal-clu-1/flux-system/gotk-sync.yaml)

# kubernetes

## external

### Cloudflare [![Cloudflare DNS Records](https://img.shields.io/badge/DNS_Records-555?logo=cloudflare&logoColor=f38020&labelColor=000)](https://dash.cloudflare.com/923309f860b1a7e801fd81224c5f56c9/emerconnelly.com/dns/records) [![Cloudflare Audit Log](https://img.shields.io/badge/Audit_Log-555?logo=cloudflare&logoColor=f38020&labelColor=000)](https://dash.cloudflare.com/923309f860b1a7e801fd81224c5f56c9/audit-log) [![Cloudflare API Tokens](https://img.shields.io/badge/API_Tokens-555?logo=cloudflare&logoColor=f38020&labelColor=000)](https://dash.cloudflare.com/profile/api-tokens)

- Automated HTTPS cert lifecycle using [`cert-manager`](https://cert-manager.io/docs/installation/helm)'s [ACME DNS01 Challenge Provider](https://cert-manager.io/docs/configuration/acme/dns01) via [Let's Encrypt](https://letsencrypt.org) with my domain [emerconnelly.com](https://www.emerconnelly.com)

### Tailscale [![Tailscale Machines](https://img.shields.io/badge/Machines-555?logo=tailscale&logoColor=fff&labelColor=242424)](https://login.tailscale.com/admin/machines) [![Tailscale ACL Editor](https://img.shields.io/badge/ACL_Editor-555?logo=tailscale&logoColor=fff&labelColor=242424)](https://login.tailscale.com/admin/machines)

- Secured external access by exposing ingress, egress, & the K8s API to my [tailnet](https://tailscale.com/kb/1136/tailnet)
- Controlled via [`tailscale-operator`](https://tailscale.com/kb/1236/kubernetes-operator)

### HCP Vault Secrets [![HCP Vault Secrets](https://img.shields.io/badge/Vault_Secrets-555?logo=hashicorp&logoColor=fff&labelColor=000)](https://portal.cloud.hashicorp.com/services/secrets?project_id=c9dc34a9-87d7-4e2d-9a1c-3d3e759f8261)

- Cloud-based secrets manager
- Controlled via [`vault-secrets-operator`](https://github.com/hashicorp/vault-secrets-operator)

## internal

### Kubernetes Dashboard [![Kubernetes Dashboard](https://img.shields.io/badge/Dashboard-555?logo=kubernetes&logoColor=326ce5&labelColor=000)](https://k8s-dashboard.homelab.emerconnelly.com)

- K8s web UI & resource explorer

### Headlamp [![Headlamp Main](https://img.shields.io/badge/Main-555)](https://headlamp.homelab.emerconnelly.com/c/main)

- K8s web UI & resource explorer

### OpenObserve [![OpenObserve Home](https://img.shields.io/badge/Home-555)](https://openobserve.homelab.emerconnelly.com/web)

- Full-stack observability (logs, traces, metrics), ~71:1 compression ratio, & a web UI for queries & dashboards

### Prometheus [![Prometheus Targets](https://img.shields.io/badge/Targets-555?logo=prometheus&logoColor=e6522c&labelColor=000)](https://prometheus.homelab.emerconnelly.com/targets)

- Time-series database for collecting & alterting on application & infrastructure metrics
- Deployed via `kube-prometheus-stack`

### Grafana [![Grafana Dashboards](https://img.shields.io/badge/Dashboards-555?logo=grafana&logoColor=f46800&labelColor=000)](https://grafana.homelab.emerconnelly.com/dashboards)

- Visualize metrics, logs, & traces from multiple sources
- Deployed via `kube-prometheus-stack`

### Cilium

- K8s eBPF-based CNI & `kube-proxy` replacement
- K8s Ingress & Gateway API controller
- K8s LoadBalancer backend via L2 Advertisments using gratuitous ARP 

#### Hubble [![Cilium Hubble](https://img.shields.io/badge/Hubble-555?logo=cilium&logoColor=f9c31f&labelColor=000)](https://hubble.homelab.emerconnelly.com)

- Visual map & event log of the Cilium CNI

### Traefik [![Traefik Dashboard](https://img.shields.io/badge/Dashboard-555?logo=traefikproxy&logoColor=24a1c1&labelColor=000)](https://traefik.homelab.emerconnelly.com/dashboard/)

- K8s Ingress & Gateway API controller
- all `*.homelab.emerconnelly.com` links are directed, via AdGuard Home DNS config, to the LoadBalancer service for this IngressClass
  - this includes both intra- & inter-cluster resources

### MinIO [![MinIO Main Tenant](https://img.shields.io/badge/Main_Tenant-555?logo=minio&logoColor=c72e49&labelColor=000)](https://main.minio.homelab.emerconnelly.com)

- Deploy highly-available & fully API-compliant S3 storage tenants
- Controlled via [`minio-operator`](https://min.io/docs/minio/kubernetes/upstream/operations/installation.html)


# GitHub Pages

- [this](https://github.com/emerconnelly/homelab/actions/workflows/github-pages.yml) workflow using [Rust mdBook](https://github.com/rust-lang/mdBook)
