# iac-comparator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**One reference architecture, many Infrastructure-as-Code implementations.**
Exploring and comparing popular Infrastructure as Code (IaC) tools by implementing the same reference cloud infrastructure using each of them.

---

(to review from here)

## Why this project?

Building the *same* cloud stack with several IaC tools is the fastest way to understand:
* authoring experience & language choices  
* state management and drift detection  
* ecosystem maturity (providers, modules, registries)  
* testing, CI/CD, and policy hooks  
* operational concerns—speed, cost, reviewability

`iac-comparator` gathers these learnings in one codebase.

---

## Reference Architecture 

* **Network**
  * One VPC (IPv4 + IPv6)
  * Public & private subnets across 3 AZs
  * Internet Gateway, NAT Gateways, route tables, NACLs
* **Compute**
  * Amazon EKS cluster (1 control plane)
  * Managed node groups in the private subnets
* **Security**
  * IAM roles for EKS control plane & nodes
  * OIDC provider for IRSA
  * Security groups for control-plane-to-node traffic
* **Storage & Data**
  * S3 bucket for artifacts/backups
* **Observability (optional)**
  * CloudWatch log groups & metrics
  * Prometheus/Grafana stack via Helm
* **Extras (stretch goals)**
  * AWS Load Balancer Controller  
  * Karpenter for cluster autoscaling

> **Diagrams** live in [`docs/diagrams`](docs/diagrams/). Generate/update them with `./scripts/render-diagrams.sh`.

---

## 🗂️ Repository Layout

```txt
iac-comparator/
├── terraform/           # HCL modules & root stacks
├── pulumi-ts/           # Pulumi in TypeScript
├── pulumi-go/           # Pulumi in Go
├── cloudformation/      # Pure YAML templates
├── cdk/                 # AWS CDK (TypeScript)
├── shared/
│   ├── examples/        # Small, focused demos
│   └── scripts/         # Helper scripts (linting, diagram generation)
├── .github/
│   └── workflows/       # CI definitions
└── docs/
    ├── comparisons/     # Feature & syntax comparison tables
    └── diagrams/        # PNG/SVG architecture diagrams
```

---

## 🔧 Tooling Status

| Tool           | Language    | Status         | Notes                                          |
|----------------|-------------|----------------|------------------------------------------------|
| Terraform      | HCL         | ✅ Implemented | Full deployment with VPC, EKS, IAM             |
| Pulumi         | TypeScript  | ⏳ In Progress | Porting IAM/OIDC logic                         |
| Pulumi         | Go          | ⏳ In Progress | Initial VPC setup working                      |
| CloudFormation | YAML        | ⏳ Planned     | Will use modular nested stacks                 |
| AWS CDK        | TypeScript  | ⏳ Planned     | Synthesize & deploy via CLI                    |

---

## 🚀 Quick Start

### 1. Clone the repo and pick a tool

```bash
git clone https://github.com/your-org/iac-comparator.git
cd iac-comparator/terraform  # or pulumi-ts, cloudformation, etc.
```

### 2. Configure your AWS CLI

```bash
aws configure
export AWS_REGION=us-west-2
```

### 3. Deploy (example: Terraform)

```bash
terraform init
terraform apply
```

> Each subdirectory has its own `README.md` with more detailed steps.

---

## 🧠 Feature Comparison Table

| Feature                  | Terraform  | Pulumi          | CloudFormation   | AWS CDK       |
|--------------------------|------------|------------------|------------------|---------------|
| Language Support         | HCL        | TypeScript, Go   | YAML/JSON        | TS/JS/Python  |
| State Management         | Remote     | Cloud or Local   | Managed by AWS   | CDK → CFN     |
| Testing Framework        | Terratest  | Jest / Go test   | TaskCat          | Jest / CDK Nag|
| Policy as Code           | Sentinel   | CrossGuard/OPA   | AWS Guard        | CDK Nag       |
| Cost Estimation          | Infracost  | Native insights  | Console/CFN tool | Console/CFN   |
| Learning Curve           | Moderate   | Moderate         | Steep            | Moderate      |

---

## 🛠 Development

### Install prerequisites

- [Terraform CLI](https://developer.hashicorp.com/terraform/downloads)
- [Pulumi CLI](https://www.pulumi.com/docs/install/)
- [Node.js + npm](https://nodejs.org/)
- [Go](https://go.dev/)
- [AWS CLI](https://aws.amazon.com/cli/)

### Common commands

```bash
# Lint all IaC files
./scripts/lint.sh

# Generate/update diagrams
./scripts/render-diagrams.sh

# Clean up environments
./scripts/destroy-all.sh
```

---

## 📈 Roadmap

- [x] Build reference architecture in Terraform
- [ ] Finish Pulumi TypeScript and Go stacks
- [ ] Implement AWS CDK version
- [ ] Add full CloudFormation templates
- [ ] Create automated CI tests with `terraform plan`, `pulumi preview`, etc.
- [ ] Write blog series on findings
- [ ] Add support for Crossplane or Bicep (Azure)

---

## 🤝 Contributing

Contributions, issues, and pull requests are welcome!  
Please read our [contribution guide](CONTRIBUTING.md) before submitting.

### Ways to contribute

- Implement missing modules (e.g., IAM roles in Pulumi Go)
- Create GitHub Actions for CI automation
- Add diagram generation tooling
- Write a usage guide or comparison post

---

## 📄 License

This project is licensed under the **MIT License**.  
See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **HashiCorp**, **Pulumi**, and **AWS** for excellent open-source IaC tools
- Inspired by real-world infrastructure needs and personal curiosity 🚀