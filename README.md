# Plantillas de Azure Pipelines

Este repositorio contiene plantillas YAML reutilizables para la definición de pipelines en Azure DevOps, orientadas a proyectos que utilizan Node.js, Flutter y despliegues en AWS (S3, ECS) o generación de APKs.

## Estructura del repositorio

```
pipelines-templates/
├── .gitignore
├── README.md
└── pipeline/
    ├── main.yml
    ├── main-pre-build.yml
    ├── build/
    │   ├── build-developmet.yml
    │   ├── build-master-front.yml
    │   ├── build-flutter.yml
    │   ├── semantic-version-integration.yml
    │   └── jobs/
    │       ├── job-electron.yml
    │       ├── job-flutter.yml
    │       ├── job-frontend.yml
    │       └── job-backend.yml
    ├── docker/
    │   └── Dockerfile
    ├── general/
    │   ├── commit-tag-changeload-flutter.yml
    │   ├── commit-tag-changeload.yml
    │   ├── semantic-version-frontend.yml
    │   ├── semantic-version-backend.yml
    │   └── semantic-version-flutter.yml
    ├── pre-build/
    │   ├── pre-build-developmet.yml
    │   └── jobs/
    │       ├── changes-file-front.yml
    │       └── changes-file.yml
    ├── release/
    │   ├── artifacts-managment.yml
    │   ├── deploy-integration.yml
    │   └── jobs/
    │       ├── aws-ecs-jobs.yml
    │       └── aws-s3-jobs.yml
    └── variables/
        └── groups-transversal-variables.yml
```

## Descripción general

- **main.yml**: Pipeline principal que orquesta los procesos de build y release según el tipo de proyecto, rama y entorno.
- **build/**: Plantillas para los distintos escenarios de construcción (build) de aplicaciones.
- **release/**: Plantillas para la gestión y despliegue de artefactos.

## Parámetros principales

- `release`: Tipo de release (`aws-s3`, `aws-ecs`, `apk`, `exe`).
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
      - master
      - develop
      - feature/*
      - hotfix/*
      - staging

extends:
  template: pipeline/main.yml
  parameters:
    language: nodejs
    release: aws-s3
    apps: {}
```

Ajusta los parámetros según tu proyecto y necesidades.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerencias o mejoras.