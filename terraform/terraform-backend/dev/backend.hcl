bucket          = "iac-comparator-terraform-dev-infra-terraform-state"
key             = "terraform/backend/terraform.tfstate"
region          = "eu-central-1"
profile         = "iac-comparator-terraform-dev"
encrypt         = true
use_lockfile    = true #S3 native locking