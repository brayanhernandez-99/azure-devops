# AGENTS.md

## What this repo is

Azure DevOps YAML pipeline templates for multi-platform CI/CD (Microfrontend, MicroServices, Flutter, Electron, Repository Config) deploying to AWS. Not application code. Not IaC/Terragrunt.

## Critical facts

- **Entry point:** `pipeline/main.yml` — consumed via `extends:` from downstream repos. Dispatches to 6 pipeline templates by `release` parameter.
- **Release types:** `aws-s3` (Microfrontend, S3+CF), `aws-ecs` (MicroServices, ECS), `apk` (Flutter), `app` (Electron), `rpc` (Repository Configuration), `playwright` (E2E — semantic version + Playwright automation, no deploy, no approval, not triggered on PullRequest).
- **Branch flow:**
  - PullRequest → triggers `aws-ecs`, `apk`, `app`, `rpc` (versionado + scan + build, sin deploy). Pre-build only in repo `apps-microfrontend-invictus` (reasons `PullRequest`/`IndividualCI`)
  - `feature/*` / `hotfix/*` → Scan (SonarQube + Gitleaks) + Build, no deploy
  - `develop` → Build + Deploy direct (no approval gate)
  - `staging` → Build + Deploy to `staging` and `staging_nacional`
  - `master` → Build + Deploy to all regions (antioquia, cap, tolima, huila, cauca, boyaca, santander, putumayo) with manual approval gate
- **Approval gate:** Only on `master`. On region `antioquia` there is a **double approval**: `WaitForApprovalGana` (environment `Deploy gana`) → then `WaitForApproval` (environment `Deploy master`, `dependsOn` the former). See `deployment.yml`.
- **SonarQube:** Separate templates for frontend (`sonarqube-frontend.yml`) and backend (`sonarqube-backend.yml`). Uses `JavaToolInstaller@0` (JDK 17), `SonarQubePrepare@7` + `SonarQubeAnalyze@7`. Quality Gate check via API. Frontend runs a **matrix per app** (`apps` param) and computes coverage via `pnpm`. PR analysis uses `pr_id`/`pr_source_branch`/`pr_target_branch` params (`sonar.pullrequest.*`). Requires extra repository resource `sonarqube-invictus` (`@sonarqube`).
- **Gitleaks:** Template `ci/tests/gitleaks.yml` — dos pasos activos: `Gitleaks@3` (repo completo, `continueOnError: true`) y `docker run zricethezav/gitleaks` sobre `origin/master..HEAD` usando `pipeline/config/gitleaks.toml` (este bloquea si hay hallazgos).
- **Pre-build:** Microfrontend-only. `changes-files-frontend.yml` detects changed apps; `check-build-frontend.yml` validates build on PRs — triggered only for repo `apps-microfrontend-invictus` under `PullRequest`/`IndividualCI`.
- **Microservices scan/build:** `pipeline-microservices.yml` skips the scan stage for `microservice-trino-invictus` (build depends directly on semantic version). Gitleaks is included in the microservice scan stage (`ci/tests/gitleaks.yml`).
- **Token replacement** uses `replacetokens@5` with delimiters `#{...}#` (not `$(...)`) — see deploy templates for target files.
- **Variable groups** are platform/branch/region-aware — see `pipeline/variables/` for the 7 variants (including `groups-variables-playwright.yml`).
- **Tag version:** Only on `antioquia` region — creates version git tag after deploy (frontend, backend, flutter, electron).
- **Docker:** `pipeline/docker/` contains `Dockerfile` and `Dockerfile-conciliation` (ECR image with superSalud certificate chain).
- **Regions:** `antioquia` (includes version tag), `cap`, `tolima`, `huila`, `cauca`, `boyaca`, `santander`, `putumayo`.
- **Pool:** `Azure Pipelines` with `ubuntu-latest` across all jobs.
- **Language:** Spanish (README, comments, display names).

## Pipeline flow

```
extends → pipeline/main.yml
              ↓
   (dispatch by release parameter)
              ↓
    Pipeline template (microfrontend/microservices/flutter/electron/rpc/playwright)
              ↓
   ┌─────────────────────────────────────┐
   │ semantic_version_<type>             │
   │   (versiona apps o servicios)       │
   └─────────────────────────────────────┘
              ↓
   ┌─────────────────────────────────────┐
   │ scan_<type>  (all branches except   │
   │   microservice-trino-invictus)      │
   │   sonarqube + gitleaks              │
   └─────────────────────────────────────┘
              ↓
   ┌─────────────────────────────────────┐
   │ build_<type>  (all branches)        │
   └─────────────────────────────────────┘
              ↓
   ┌─────────────────────────────────────┐
   │ WaitForApproval (master only)       │
   │   antioquia: Deploy gana → Deploy   │
   │   master (double approval)          │
   └─────────────────────────────────────┘
              ↓
   ┌─────────────────────────────────────┐
   │ deploy_<type>  (develop/staging/master)│
   │   + tag-version (antioquia only)      │
   └─────────────────────────────────────┘
```

Playwright diverges: `semantic_version_playwright` → `playwright_automation` (no scan/build/deploy stage).

## Root-level files

No utility scripts at repo root.
