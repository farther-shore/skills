# Infrastructure with OpenTofu

Use this when a business needs more than one environment, or when the hosting
must be reproducible by someone other than the person who clicked it into
existence. For a single first service, the host's own CLI is faster — see the
quick path in [the skill](../SKILL.md#deployment-is-a-prerequisite).

FartherShore is the gateway, billing, and entitlement plane in front of an HTTP
service that the builder runs. It never provisions that service.

## Ownership

| Thing                                                     | Owner                                             |
| --------------------------------------------------------- | ------------------------------------------------- |
| Host project, service, deployment, public hostname        | OpenTofu                                          |
| `FS_RUNTIME_TOKEN` delivery into the host's secret store  | OpenTofu, as a sensitive variable it does not mint |
| Plans, pricing, routes, meters, limits, `fs.backend()`    | `business/` in the managed repository             |
| Environment rows, origin bindings, runtime token issuance | The `farthershore` CLI                            |

OpenTofu never authors contract state; the CLI never provisions hosting. Runtime
tokens are **minted** by the CLI and **delivered** by OpenTofu.

## Map environments one-to-one

| FartherShore              | Git branch     | Infrastructure         |
| ------------------------- | -------------- | ---------------------- |
| preview environment `preview` | `env/preview`  | workspace `preview`     |
| production                | default branch | workspace `production`  |

Name both sides identically. Give each environment its own deployment and its
own `FS_RUNTIME_TOKEN`: a token minted with `--env preview` cannot bootstrap
production, so a compromised preview deployment cannot serve live customers.

## State

Shared infrastructure must not use local state. Configure a remote backend with
locking before the first `tofu apply`, and keep one state file per environment
(separate workspaces, or separate backend keys).

```hcl
terraform {
  required_version = ">= 1.10"

  backend "s3" {
    bucket = "acme-tofu-state"
    key    = "farthershore/api.tfstate"
    region = "us-east-1"
    # Native S3 conditional-write locking. On older OpenTofu, lock with
    # `dynamodb_table` instead; both mechanisms remain supported.
    use_lockfile = true
  }
}
```

State holds secret values in plaintext. Encrypt the bucket, restrict read
access, never commit a `.tfstate`, and prefer OpenTofu's own state encryption on
top of the backend's.

## Example: Railway

Resource names and arguments below match the community Railway provider's
published schema. Substitute another provider if the builder deploys elsewhere —
the shape is what matters: a project scope, one service per environment, a
public HTTPS hostname, and a secret variable bound to that service and
environment.

```hcl
terraform {
  required_providers {
    railway = {
      source  = "terraform-community-providers/railway"
      version = "~> 0.5"
    }
  }
}

# RAILWAY_TOKEN comes from the environment; never write it into a .tf file.
provider "railway" {}

variable "environment_name" {
  type        = string
  description = "preview or production; matches the FartherShore environment"
}

variable "fs_runtime_token" {
  type        = string
  sensitive   = true
  description = "Minted by farthershore backend tokens create for THIS environment"
}

resource "railway_project" "api" {
  name    = "acme-api"
  private = true
}

resource "railway_environment" "this" {
  name       = var.environment_name
  project_id = railway_project.api.id
}

resource "railway_service" "api" {
  name               = "api"
  project_id         = railway_project.api.id
  source_repo        = "acme/acme-api"
  source_repo_branch = var.environment_name == "production" ? "main" : "env/preview"
  root_directory     = "/api"
}

resource "railway_service_domain" "api" {
  subdomain      = "acme-api-${var.environment_name}"
  environment_id = railway_environment.this.id
  service_id     = railway_service.api.id
}

resource "railway_variable" "runtime_token" {
  name           = "FS_RUNTIME_TOKEN"
  value          = var.fs_runtime_token
  environment_id = railway_environment.this.id
  service_id     = railway_service.api.id
}

output "origin_url" {
  value = "https://${railway_service_domain.api.domain}"
}
```

Pass the secret from the builder's secret store, never a committed tfvars file:

```bash
tofu workspace select preview
TF_VAR_fs_runtime_token="$(read-from-the-secret-store)" \
  tofu apply -var environment_name=preview
```

## Order of operations

A runtime token scopes to backend rows, so the row must exist before the mint.

1. Declare the logical backend in `business/` and push the branch so the
   environment has an accepted contract:
   `const api = fs.backend("api", { transport: { mode: "direct" }, default: true });`
2. Provision that environment's hosting and read its hostname:
   `tofu workspace select preview && tofu apply -var environment_name=preview`
   then `tofu output -raw origin_url`.
3. Register the origin:

   ```bash
   farthershore backend create <business> \
     --env preview \
     --name api --slug api \
     --transport direct \
     --origin-url "$(tofu output -raw origin_url)" \
     --default \
     --format json
   ```

4. Mint the environment's token **after** that row exists, then deliver it:

   ```bash
   farthershore backend tokens create <business> \
     --env preview \
     --format json
   ```

   Add `--backend <backend-id>` when the environment has more than one backend,
   so the token resolves to the intended row. Store the one-time value in the
   secret store and re-apply so the host receives it. Never echo it.

5. Repeat for production (omit `--env`; production is the default target) with a
   production-scoped token.

Steps 3 and 4 cannot be inverted and cannot move into OpenTofu: the token is a
one-time secret returned by a CLI write, not a declarable resource.

## What to re-run when something changes

| Change                                               | Re-run                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| Anything in `business/` — plans, routes, meters, limits | `git push` only. No `tofu` run.                                          |
| Backend application code in `api/`                   | The host's deploy, often automatic from the branch.                        |
| A **new** `fs.backend()` slug                        | `tofu apply`, then `backend create` + `tokens create`.                     |
| A new environment                                    | `farthershore env create`, `tofu apply` in a new workspace, then `backend create` + `tokens create`. |
| Hostname, region, replicas, sizing                   | `tofu plan`, `tofu apply`, then `backend bind --env <name> --origin-url <new-url>` if the hostname moved. |
| Token rotation                                       | `backend tokens create`, update the secret, re-apply, verify, then revoke the predecessor. |

Always read `tofu plan` before `tofu apply`. A plan proposing to replace the
service or its domain changes the origin URL, which needs a matching
`farthershore backend bind` or the gateway returns `origin_unavailable`.

## Verify

- `tofu output -raw origin_url` serves `/healthz` unauthenticated.
- `farthershore backend list <business> --format json` shows a concrete target
  per environment. This read is business-wide and takes no `--env`; read the
  environment off each row.
- A signed gateway request reaches the backend; a direct call without a platform
  signature fails with `missing_signature`.
- Publishing production succeeds. `BACKEND_TARGET_REQUIRED` means a declared
  backend still has no production binding.
