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
* operational concerns—speed, cost, reviewability

`iac-comparator` gathers these learnings in one codebase.

## Table of Contents
1. [Reference Architecture](#1-refernce-architecture)
2. [Getting Started](#2-getting-started)
3. [Tooling Status](#3-tooling-status)
4. [Feature Comparison](#4-feature-comparison)
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
| Terraform      | HCL         | ⏳ In Progress | Lorem Ipsum                                    | 
| Pulumi         | TypeScript  | ⏳ In Progress | Lorem Ipsum                                    |
| Pulumi         | Go          | ⏳ Planned     | Lorem Ipsum                                    |
| CloudFormation | YAML        | ⏳ Planned     | Lorem Ipsum                                    |
| AWS CDK        | TypeScript  | ⏳ Planned     | Lorem Ipsum                                    |


## 4. Feature Comparison

TODO

| Feature                  | Terraform  | Pulumi          | CloudFormation   | AWS CDK       |
|--------------------------|------------|------------------|------------------|---------------|
| Language Support         | HCL        | TypeScript, Go   | YAML/JSON        | TS/JS/Python  |


## 5. How to Contribute

Please refer to the [Contributing](https://github.com/nicolaDeCristofaro/iac-comparator/blob/main/CONTRIBUTING.md) guide and the [Code of Conduct](https://github.com/nicolaDeCristofaro/iac-comparator/blob/main/CODE_OF_CONDUCT.md) for more information on how to contribute.


## License

This project is licensed under the **MIT License**.  
See [LICENSE](LICENSE) for details.

## Acknowledgments

- **HashiCorp**, **Pulumi**, and **AWS** for excellent open-source IaC tools
- Inspired by real-world infrastructure needs and personal curiosity 🚀