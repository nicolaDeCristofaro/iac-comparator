# IaC Comparator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**One reference architecture, many Infrastructure-as-Code implementations.**
Exploring and comparing popular Infrastructure as Code (IaC) tools by implementing the same reference cloud infrastructure using each of them.

---

## Why this project?

Building the *same* cloud stack with several IaC tools is the fastest way to understand:
* authoring experience & language choices  
* state management and drift detection  
* ecosystem maturity (providers, modules, registries)  
* testing and CI/CD  
* operational concerns—speed, cost, reviewability

`iac-comparator` gathers these learnings in one codebase.

---

## Reference Architecture 
TODO

---

## Repository Layout
TODO

```txt
iac-comparator/
├── aws-cdk-python/                 # AWS CDK (Pyhton)
├── cloudformation/                 # Pure YAML templates
├── pulumi-go/                      # Pulumi in Go
├── pulumi-ts/                      # Pulumi in TypeScript
├── terraform-custom-modules/       # HCL custom modules & root stacks
├── terraform-official-modules/     # HCL official modules & root stacks
└── docs/
    ├── comparisons/     # Feature & syntax comparison tables
    └── diagrams/        # PNG/SVG architecture diagrams
```

---

## 🔧 Tooling Status

| Tool           | Language    | Status         | Notes                                          |
|----------------|-------------|----------------|------------------------------------------------|
| Terraform      | HCL         | ⏳ In Progress | Lorem Ipsum                                    | 
| Pulumi         | TypeScript  | ⏳ In Progress | Lorem Ipsum                                    |
| Pulumi         | Go          | ⏳ Planned     | Lorem Ipsum                                    |
| CloudFormation | YAML        | ⏳ Planned     | Lorem Ipsum                                    |
| AWS CDK        | TypeScript  | ⏳ Planned     | Lorem Ipsum                                    |

---

## Quick Start

### 1. Clone the repo and pick a tool

TODO

> Each subdirectory has its own `README.md` with more detailed steps.

---

## Feature Comparison Table

TODO

| Feature                  | Terraform  | Pulumi          | CloudFormation   | AWS CDK       |
|--------------------------|------------|------------------|------------------|---------------|
| Language Support         | HCL        | TypeScript, Go   | YAML/JSON        | TS/JS/Python  |


---

## Development

### Install prerequisites
TODO

- [Terraform CLI](https://developer.hashicorp.com/terraform/downloads)
- [Pulumi CLI](https://www.pulumi.com/docs/install/)
- [Node.js + npm](https://nodejs.org/)
- [Go](https://go.dev/)
- [AWS CLI](https://aws.amazon.com/cli/)

---

## Roadmap

TODO

---

## Contributing

TODO

---

## 📄 License

This project is licensed under the **MIT License**.  
See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **HashiCorp**, **Pulumi**, and **AWS** for excellent open-source IaC tools
- Inspired by real-world infrastructure needs and personal curiosity 🚀