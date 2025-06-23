bucket          = "iac-comparator-terraform-prod-infra-terraform-state"
key             = "terraform/backend/terraform.tfstate"
region          = "eu-central-1"
profile         = "iac-comparator-terraform-prod"
encrypt         = true
use_lockfile    = true #S3 native locking