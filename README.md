# Plantillas de Azure Pipelines

Este repositorio contiene plantillas YAML reutilizables para la definición de pipelines en Azure DevOps, orientadas a proyectos **Microfrontend**, **MicroServices**, **Flutter**, **Electron** y **Repository Configuration**, más pruebas E2E con **Playwright**, con despliegues en AWS (S3 + CloudFront, ECS) o generación de APKs/EXEs.

## Estructura del repositorio

```
pipeline/
├── main.yml                              ← Entry point (via extends:)
├── pipelines/
│   ├── pipeline-microfrontend.yml        ← aws-s3 (Vue, S3 + CloudFront)
│   ├── pipeline-microservices.yml        ← aws-ecs (Backend, ECS)
│   ├── pipeline-flutter.yml              ← apk (Flutter)
│   ├── pipeline-electron.yml             ← app (Electron)
│   ├── pipeline-repository-configuration.yml  ← rpc (Config)
│   ├── pipeline-playwright.yml           ← playwright (E2E)
│   └── pipeline-pre-build.yml            ← Pre-build Microfrontend
├── ci/
│   ├── semantic-version-integration.yml  ← Orquesta versionado por release
│   ├── build/
│   │   ├── build-frontend.yml
│   │   ├── build-backend.yml
│   │   ├── build-flutter.yml
│   │   ├── build-electron.yml
│   │   ├── build-repository-configuration.yml
│   │   └── build-playwright.yml
│   ├── general/
│   │   ├── semantic-version-frontend.yml
│   │   ├── semantic-version-backend.yml
│   │   ├── semantic-version-flutter.yml
│   │   ├── semantic-version-electron.yml
│   │   ├── semantic-version-repository-configuration.yml
│   │   └── semantic-version-playwright.yml
│   ├── pre-build/
│   │   ├── changes-files-frontend.yml
│   │   └── check-build-frontend.yml
│   └── tests/
│       ├── sonarqube-backend.yml
│       ├── sonarqube-frontend.yml
│       └── gitleaks.yml
├── cd/
│   ├── deployment.yml                    ← Approval gate + deploy dispatch
│   ├── deploy/
│   │   ├── deploy-frontend.yml
│   │   ├── deploy-backend.yml
│   │   ├── deploy-flutter.yml
│   │   ├── deploy-electron.yml
│   │   └── deploy-repository-configuration.yml
│   └── tags/
│       ├── tag-version-frontend.yml
│       ├── tag-version-backend.yml
│       ├── tag-version-flutter.yml
│       └── tag-version-electron.yml
├── variables/
│   ├── groups-variables-backend.yml
│   ├── groups-variables-frontend.yml
│   ├── groups-variables-flutter.yml
│   ├── groups-variables-electron.yml
│   ├── groups-variables-rpc.yml
│   ├── groups-variables-playwright.yml
│   └── groups-variables-pre-build.yml
├── config/
│   ├── vitest.config.mts
│   └── gitleaks.toml
└── docker/
    ├── Dockerfile
    └── Dockerfile-conciliation
```

## Descripción general

- **main.yml**: Pipeline principal que orquesta los procesos de build y release según el tipo de proyecto, rama y entorno.
- **pipelines/**: Templates por tipo de release (aws-s3, aws-ecs, apk, app, rpc, playwright), cada uno con stages de semantic version, scan, build y deploy (según aplique).
- **ci/**: Jobs de versionado semántico, builds, análisis estático (SonarQube, Gitleaks) y pre-build (detección de cambios).
- **cd/**: Deploy con approval gate (solo master, doble aprobación para la región `antioquia`), despliegue por plataforma y tag de versión.
- **variables/**: Grupos de variables por plataforma y entorno (develop, staging, staging_nacional, master por región).
- **docker/**: Dockerfiles para microservicios. `Dockerfile` estándar y `Dockerfile-conciliation` (imagen ECR con cadena de certificados de supersalud para el servicio de conciliación).

## Parámetros principales

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `release` | string | Tipo de release: `aws-s3`, `aws-ecs`, `apk`, `app`, `rpc`, `playwright` |
| `apps` | object | Lista de apps para microfrontend |
| `red` | object | Regiones para deploy en master (`antioquia`, `cap`, `tolima`, ...) |
| `environments_staging` | object | Entornos staging (`staging`, `staging_nacional`) |
| `pr_id` | number | ID del Pull Request (0 si no aplica) |
| `pr_source_branch` | string | Rama origen del Pull Request (vacío si no aplica) |
| `pr_target_branch` | string | Rama destino del Pull Request (vacío si no aplica) |

## Flujos soportados

- **feature/* y hotfix/***: Scan (SonarQube + Gitleaks) + Build. Sin deploy.
- **develop**: Build + Deploy directo (sin approval).
- **staging**: Build + Deploy a `staging` y `staging_nacional`.
- **master**: Build + Deploy a todas las regiones con **approval gate** manual. En la región `antioquia` hay **doble aprobación** (entornos `Deploy gana` y `Deploy master`).
- **PullRequest**: Los releases `aws-ecs`, `apk`, `app` y `rpc` se ejecutan también con razón `PullRequest` (versionado + scan + build, sin deploy). Para microfrontend (`apps-microfrontend-invictus`) se incluye el pre-build (detección de cambios + check build).
- **playwright**: Versionado + ejecución de pruebas E2E (descarga artefactos Electron desde S3 y corre `playwright test`). Sin deploy ni approval. Aplica en feature/hotfix, develop, staging y master (no en PullRequest).

## Uso

Incluye la plantilla principal en tu pipeline de Azure DevOps:

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - feature/*
      - hotfix/*
      - develop
      - staging
      - master

resources:
  repositories:
    - repository: templates
      name: DevOps-templates-UX/pipelines-templates
      type: git
      ref: master

extends:
  template: pipeline/main.yml@templates
  parameters:
    release: aws-s3     # aws-s3 | aws-ecs | apk | app | rpc | playwright
    apps:               # solo para aws-s3
      - app-administration-vue2
      - app-sellers-vue2
```

Ajusta los parámetros según tu proyecto y necesidades.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.
