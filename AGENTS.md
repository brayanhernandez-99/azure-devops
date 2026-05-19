# AGENTS.md

## What this repo is

Azure DevOps YAML pipeline templates for **Infrastructure-as-Code (IaC)** using Terragrunt + Terraform on AWS. Not application code.

## Critical facts

- **README.md is outdated.** It describes an old Node.js/Flutter structure. The actual repo is purely IaC pipelines deploying to AWS across Colombian regions (CAP, Tolima, Huila, Cauca, Boyaca, Santander, Putumayo).
- **Entry point:** `pipeline/main.yml` → `pipeline/pipelines/pipeline-infrastructure.yml`. Consumed via `extends:` in downstream repos.
- **Structure:**
  - `pipeline/ci/scan/` — SonarQube analysis (active), Checkov scan (commented out in pipeline)
  - `pipeline/ci/build/` — Terragrunt plan
  - `pipeline/cd/deploy/` — Terragrunt apply (preceded by manual approval gate)
- **Token replacement** uses `replacetokens@5` with delimiters `#{...}#` (not `$(...)`)
- **Different AWS creds per phase:** plan uses `AWS_ACCESS_KEY_ID_DEPLOY` / `AWS_SECRET_ACCESS_KEY_DEPLOY`; apply uses `AWS_ACCESS_KEY_ID_INVICTUS` / `AWS_SECRET_ACCESS_KEY_INVICTUS`
- **Tooling:** Terragrunt 0.84.1 + Terraform 1.12.0 downloaded at runtime via curl on ubuntu-22.04
- **`.terragrunt-cache` cleanup** (`find . -type d -name ".terragrunt-cache" -exec rm -rf {} +`) is required after each service
- **Variable groups** are branch/environment/region-aware — see `pipeline/variables/groups-transversal-variables-iac.yml`
- **Branch flow:** `develop` → single region; `staging` → `staging` or `staging_nacional`; `master` → all regions in `red` parameter
- **Language:** Spanish (README, comments, display names)

## Root-level YAML files (`cloudmap.yml`, `done.yml`, `ecstaskroleBFF.yml`, `eventbridge.yml`, `import.yml`, `secrets.yml`)

These are scratch/operational files — inline terragrunt commands for ad-hoc service provisioning. Not part of the pipeline template chain. Mostly commented out. Do not treat them as pipeline templates.

## Pipeline flow

```
scan_infrastructure (SonarQube)
       ↓
plan_infrastructure (terragrunt plan --all --non-interactive -no-color)
       ↓
WaitForApproval (manual, Azure environment gates per branch)
       ↓
apply_infrastructure (terragrunt plan + apply)
```
