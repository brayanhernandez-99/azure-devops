# Plantillas de Azure Pipelines

Este repositorio contiene plantillas YAML reutilizables para la definición de pipelines en Azure DevOps, orientadas a proyectos que utilizan Node.js, Flutter y despliegues en AWS (S3, ECS) o generación de APKs.

## Estructura del repositorio

```

pipelines-templates/
├── main.yml
├── cd/
│   ├── deployment.yml
│   ├── commit/
│   │   ├── commit-version-backend.yml
│   │   ├── commit-version-electron.yml
│   │   ├── commit-version-electron-new.yml
│   │   ├── commit-version-flutter.yml
│   │   ├── commit-version-frontend.yml
│   │   └── commit-version-frontend-new.yml
│   └── deploy/
│       ├── deploy-backend.yml
│       ├── deploy-electron.yml
│       ├── deploy-electron-new.yml
│       ├── deploy-flutter.yml
│       ├── deploy-frontend.yml
│       └── deploy-repository-configuration.yml
├── ci/
│   ├── semantic-version-integration.yml
│   ├── build/
│   │   ├── build-backend.yml
│   │   ├── build-electron.yml
│   │   ├── build-electron-new.yml
│   │   ├── build-flutter.yml
│   │   ├── build-frontend.yml
│   │   ├── build-frontend-new.yml
│   │   └── build-repository-configuration.yml
│   ├── general/
│   │   ├── semantic-version-backend.yml
│   │   ├── semantic-version-electron.yml
│   │   ├── semantic-version-electron-new.yml
│   │   ├── semantic-version-flutter.yml
│   │   ├── semantic-version-frontend.yml
│   │   ├── semantic-version-frontend-new.yml
│   │   └── semantic-version-repository-configuration.yml
│   └── tests/
│       └── sonarqube.yml
├── docker/
│   └── Dockerfile
├── pipelines/
│   ├── pipeline-electron.yml
│   ├── pipeline-flutter.yml
│   ├── pipeline-micro-frontend.yml
│   ├── pipeline-micro-frontend-electron.yml
│   ├── pipeline-micro-services.yml
│   └── pipeline-repository-configuration.yml
└── variables/
    ├── groups-transversal-variables-backend.yml
    ├── groups-transversal-variables-electron.yml
    ├── groups-transversal-variables-electron-new.yml
    ├── groups-transversal-variables-flutter.yml
    ├── groups-transversal-variables-frontend.yml
    ├── groups-transversal-variables-frontend-new.yml
    └── groups-transversal-variables-rpc.yml
```

## Descripción general

- **main.yml**: Pipeline principal que orquesta los procesos de build y release según el tipo de proyecto, rama y entorno.
- **build/**: Plantillas para los distintos escenarios de construcción (build) de aplicaciones.
- **release/**: Plantillas para la gestión y despliegue de artefactos.

## Parámetros principales

- `release`: Tipo de release (`aws-s3`, `aws-ecs`, `apk`, `exe`, `rpc`).
- `red`: Lista de regiones para despliegue (por defecto: antioquia, cap, tolima, huila, cauca, boyaca).
- `apps`: Objeto para definir aplicaciones específicas.

## Flujos soportados

- **Build y Release** para ramas `feature/`, `hotfix/`, `develop`, `staging`, `master` y tags.
- **Soporte por región**: En ramas como `master`, los builds y despliegues pueden ejecutarse por cada región definida en el parámetro `red`.
- **Soporte multiplataforma**: Node.js backend, Node.js frontend y Flutter.
- **Despliegue en AWS**: S3, ECS y generación de APKs.

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
      - master
      - staging
    exclude:
      - version/*

pr:
  branches:
    include:
      - develop
      - master
      - staging

resources:
  repositories:
    - repository: templates
      name: DevOps-templates-UX/pipelines-templates
      type: git
      ref: master

extends:
  template: pipeline/main.yml@templates
  parameters:
    release: <release>
```

Ajusta los parámetros según tu proyecto y necesidades.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.