module "kms" {
  source = "../../modules/kms"

  project_name = var.project_name
  environment  = var.environment

  kms_scope                    = var.kms_scope
  kms_description              = var.kms_description
  kms_deletion_window_in_days  = var.kms_deletion_window_in_days
  kms_enable_key_rotation      = var.kms_enable_key_rotation
  kms_policy                   = var.kms_policy
  kms_key_usage                = var.kms_key_usage
  kms_customer_master_key_spec = var.kms_customer_master_key_spec
  kms_multi_region             = var.kms_multi_region
}
