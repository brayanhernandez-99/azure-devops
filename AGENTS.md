# AGENTS.md

## What this repo is

Azure DevOps YAML pipeline templates for multi-platform CI/CD (Microfrontend, MicroServices, Flutter, Electron, Repository Config) deploying to AWS. Not application code. Not IaC/Terragrunt.

## Critical facts

- **Entry point:** `pipeline/main.yml` — consumed via `extends:` from downstream repos. Dispatches to 5 pipeline templates by `release` parameter.
- **Release types:** `aws-s3` (Microfrontend, S3+CF), `aws-ecs` (MicroServices, ECS), `apk` (Flutter), `app` (Electron), `rpc` (Repository Configuration).
- **Branch flow:**
  - `feature/*` / `hotfix/*` → Scan (SonarQube + Gitleaks) + Build, no deploy
  - `develop` → Build + Deploy direct (no approval gate)
  - `staging` → Build + Deploy to `staging` and `staging_nacional`
  - `master` → Build + Deploy to all regions (antioquia, cap, tolima, huila, cauca, boyaca, santander, putumayo) with manual approval gate
- **Approval gate:** Only on `master` — uses Azure environment `Deploy master`. `deployment.yml` checks `Build.SourceBranchName`.
- **SonarQube:** Separate templates for frontend (`sonarqube-frontend.yml`) and backend (`sonarqube-backend.yml`). Uses `JavaToolInstaller@0` (JDK 17), `SonarQubePrepare@7` + `SonarQubeAnalyze@7`. Quality Gate check via API.
- **Gitleaks:** Template `ci/tests/gitleaks.yml` — dos pasos activos: `Gitleaks@3` (repo completo, `continueOnError: true`) y `docker run zricethezav/gitleaks` sobre `origin/master..HEAD` usando `pipeline/config/gitleaks.toml` (este bloquea si hay hallazgos).
- **Pre-build:** Microfrontend-only. `changes-files-frontend.yml` detects changed apps; `check-build-frontend.yml` validates build on PRs.
- **Token replacement** uses `replacetokens@5` with delimiters `#{...}#` (not `$(...)`) — see deploy templates for target files.
- **Variable groups** are platform/branch/region-aware — see `pipeline/variables/` for the 6 variants.
- **Tag version:** Only on `antioquia` region — creates version git tag after deploy (frontend, backend, flutter, electron).
- **Regions:** `antioquia` (includes version tag), `cap`, `tolima`, `huila`, `cauca`, `boyaca`, `santander`, `putumayo`.
- **Pool:** `Azure Pipelines` with `ubuntu-latest` across all jobs.
- **Language:** Spanish (README, comments, display names).

## Pipeline flow

```
extends → pipeline/main.yml
              ↓
   (dispatch by release parameter)
              ↓
    Pipeline template (microfrontend/microservices/flutter/electron/rpc)
              ↓
   ┌─────────────────────────────────────┐
   │ semantic_version_<type>             │
   │   (versiona apps o servicios)       │
   └─────────────────────────────────────┘
              ↓
   ┌─────────────────────────────────────┐
   │ scan_<type>  (feature/hotfix only)  │
   │   sonarqube + gitleaks              │
   └─────────────────────────────────────┘
              ↓
   ┌─────────────────────────────────────┐
   │ build_<type>  (all branches)        │
   └─────────────────────────────────────┘
              ↓
   ┌─────────────────────────────────────┐
   │ WaitForApproval  (master only)      │
   └─────────────────────────────────────┘
              ↓
   ┌─────────────────────────────────────┐
   │ deploy_<type>  (develop/staging/master)│
   │   + tag-version (antioquia only)      │
   └─────────────────────────────────────┘
```

## Root-level files

No utility scripts at repo root.
