# IaC Comparator - One reference architecture, many Infrastructure-as-Code implementations

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Kubernetes](https://img.shields.io/badge/kubernetes-v1.31-blue)
![AWS](https://img.shields.io/badge/AWS-Cloud-orange)

Exploring and comparing popular Infrastructure as Code (IaC) tools by implementing the same reference cloud infrastructure using each of them.

## Why this project?

Building the *same* cloud stack with several IaC tools is the fastest way to understand:
* authoring experience & language choices  
* state management  
* ecosystem maturity (providers, modules, multi-environments)  
* testing and CI/CD  
* operational concerns like speed, cost, reviewability

`iac-comparator` gathers these learnings in one codebase.

## Table of Contents
1. [Reference Architecture](#1-refernce-architecture)
2. [Getting Started](#2-getting-started)
3. [Tooling Status](#3-tooling-status)
4. [Feature Comparison](#4-comparison)
5. [How to Contribute](#5-how-to-contribute)

## 1. Reference Architecture 

This section provides a **visual representation of the AWS infrastructure**, chosen as reference for this project, outlining and describing key components. It allows to understand the high-level architecture and how different services interact with each other.

![AWS_Infrastructure_Diagram](./images/infrastructure_diagram.png)

Here’s a short description of the services presented in the infrastructure diagram:

- **VPC and subnets**: The infrastructure is deployed in a VPC with multiple subnets (public and private) for various purposes:
    - **Public Subnets (A, B, C)**: Host services that need direct access to the internet, such as the Network or Application Load Balancer, which distributes incoming traffic to the backend services inside the EKS Cluster.
    - **Private Subnets (A, B, C)**: Dedicated for backend services like the AWS EKS Cluster (Elastic Kubernetes Service) with no direct internet access.
- **EKS (Elastic Kubernetes Service)**: EKS manages the containerized application workloads and other platform-related services for example Grafana for dashboarding, Prometheus for metrics, Loki for logging, and ArgoCD as GitOps tool.
- **EC2 Bastion Host**: TODO
- **Security & Management Services**:
    - IAM Roles for giving specific permissions within AWS to role assumers.
    - KMS (Key Management Service) which allows to encrypt/decrypt sensitive data.

\*A **Multi-AZ (Availability Zone) deployment** is utilized across all services to ensure high availability and fault tolerance.


## 2. Getting Started

### 1. Clone the repo and pick a tool

TODO

> Each subdirectory has its own `README.md` with more detailed steps.

## 3. Tooling Status
TODO
Section Intro 

| Tool           | Language    | Status         | Notes                                          |
|----------------|-------------|----------------|------------------------------------------------|
| Terraform with official modules      | HCL         | ⏳ In Progress | Lorem Ipsum                                    | 
| Terraform with custom modules         | TypeScript  | ⏳ In Progress | Lorem Ipsum                                    |
| OpenTofu         | HCL  | ⏳ In Progress | Lorem Ipsum                                    |
| Pulumi         | TypeScript  | ⏳ In Progress | Lorem Ipsum                                    |
| Pulumi         | Go          | ⏳ Planned     | Lorem Ipsum                                    |
| CloudFormation | YAML        | ⏳ Planned     | Lorem Ipsum                                    |
| AWS CDK        | TypeScript  | ⏳ Planned     | Lorem Ipsum                                    |


## 4. Comparison

TODO

## 4. Feature Comparison

TODO: these are all the factors I want to compare, but I want to deep dive on each of them, so i'll make a subchapter for each factor and then a final summary table like the one below.

Below is a side‑by‑side matrix of critical capabilities across the supported Infrastructure‑as‑Code tools. 

| Capability                     | Terraform                                                           | OpenTofu                                  | Pulumi (TS/Py/Go/.NET)                                      | AWS CloudFormation             | AWS CDK                                |
| ------------------------------ | ------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------- | ------------------------------ | -------------------------------------- |
| **Authoring language**         | HCL 2 (declarative)                                                 | HCL 2                                     | General‑purpose (TypeScript, Python, Go, C#, YAML beta)     | JSON or YAML                   | General‑purpose (TS, Py, Java, C#, Go) |
| **State backend options**      | Local file, S3 + DynamoDB, GCS, Azure Blob, Terraform Cloud, Consul | Same back‑ends, OpenTofu Cloud (road‑map) | Local file, S3, Azure, GCS, Pulumi Cloud (default)          | Managed transparently by AWS   | Managed by AWS (via CloudFormation)    |
| **Plan / Preview diff**        | `terraform plan`                                                    | `tofu plan`                               | `pulumi preview`                                            | Change Sets (`cfn diff`)       | `cdk diff`                             |
| **Drift detection**            | `terraform plan -refresh-only`                                      | Same                                      | Automatic refresh every run; Pulumi Cloud drift dashboard   | Built‑in console & events      | Via CloudFormation                     |
| **Testing frameworks**         | Terratest, Kitchen‑Terraform, Checkov, Conftest                     | Same                                      | Native unit (Mocks), integration tests, CrossGuard          | taskcat, CFN Guard, cfn‑nag    | CDK Assertions (Jest/PyTest), CDK‑Nag  |
| **Policy as Code**             | Sentinel (TFC), OPA/Conftest, Checkov                               | OPA/Conftest                              | CrossGuard (native), OPA plugins                            | CFN Guard                      | CDK‑Nag, CFN Guard                     |
| **Module / Package ecosystem** | **Terraform Registry** (>14k modules)                               | **OpenTF Registry** (early mirror)        | **Pulumi Registry** (incl. tf‑bridged); tf2pulumi converter | AWS & Partner sample templates | **Construct Hub** (npm, PyPI, etc.)    |
| **Multi‑cloud support**        | \~1 500 providers                                                   | Same                                      | 120+ providers inc. SaaS                                    | AWS‑only                       | AWS‑centric; multi‑cloud via CDKTF     |
| **Secrets handling**           | Vault, TFC, KMS, `sensitive` attrs                                  | Same                                      | Per‑stack secrets (KMS/GCP KMS/Azure KV/passphrase)         | KMS‑encrypted Parameters       | KMS, Secrets Manager, SSM              |
| **Execution model**            | Local CLI; optional remote runners (TFC)                            | Same                                      | CLI per language → engine graph → apply                     | Managed by AWS service         | Synthesises → CloudFormation → deploy  |
| **Maturity (2025)**            | Launched 2014                                                       | Forked 2023                               | Launched 2017                                               | Launched 2011                  | Launched 2019                          |
| **License**                    | MPL‑2.0 (core), BSL‑licensed CLI past 1.6                           | Pure MPL‑2.0 / LGPL                       | Apache‑2.0                                                  | Proprietary AWS                | Apache‑2.0                             |
| **Commercial SaaS**            | Terraform Cloud & Enterprise                                        | OpenTofu Cloud (announced)                | Pulumi Cloud                                                | Service cost baked into AWS    | N/A (uses CloudFormation)              |
| **Cost estimation**            | Infracost, TFC RunTasks                                             | Same                                      | Pulumi Cost, Infracost                                      | AWS Cost Estimator (limited)   | Same as CFN                            |
| **IDE plugins / LSP**          | HashiCorp HLS (VS Code, JetBrains)                                  | Same                                      | Native language servers, Pulumi VS Code ext.                | VS Code JSON/YAML schema       | CDK VS Code & JetBrains                |
| **Typical speed**              | Moderate (refresh cost)                                             | Moderate                                  | Fast preview; apply dominated by API                        | Slow for very large stacks     | Synth fast; deploy inherits CFN speed  |

add also popularity & reviews in the community citing sources

<small>\* todo.</small>

## 5. How to Contribute

Please refer to the [Contributing](https://github.com/nicolaDeCristofaro/iac-comparator/blob/main/CONTRIBUTING.md) guide and the [Code of Conduct](https://github.com/nicolaDeCristofaro/iac-comparator/blob/main/CODE_OF_CONDUCT.md) for more information on how to contribute.


## License

This project is licensed under the **MIT License**.  
See [LICENSE](LICENSE) for details.

## Acknowledgments

- **HashiCorp**, **Pulumi**, and **AWS** for excellent open-source IaC tools
- Inspired by real-world infrastructure needs and personal curiosity 🚀