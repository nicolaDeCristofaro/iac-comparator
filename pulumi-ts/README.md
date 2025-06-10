Intro
//TODO TO REVIEW

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/download) and [npm](https://www.npmjs.com/package/npm) installed locally
- [Pulumi](https://www.pulumi.com/docs/iac/get-started/aws/begin/) CLI (v3+ recommended)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) (only if deploying to AWS) with [credentials configured](https://www.pulumi.com/docs/iac/get-started/aws/configure/)

### Getting Started

1. Clone the Repo

```bash
git clone https://github.com/nicolaDeCristofaro/iac-comparator
cd pulumi-ts
```

```bash
mkdir aws-eks-based-infrastructure
cd aws-eks-based-infrastructure
pulumi new aws-typescript
```

If this is your first time running Pulumi, you will be prompted to log into Pulumi Cloud. Pulumi Cloud is free for individuals and small teams. -> link to the guide for Pulumi Backend

Follow the wizard...

pulumi config set aws:profile iac-comparator-pulumi-dev
to check > pulumi config

