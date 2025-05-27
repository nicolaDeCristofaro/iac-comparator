resource "aws_kms_key" "kms" {
  deletion_window_in_days  = var.kms_deletion_window_in_days
  enable_key_rotation      = var.kms_enable_key_rotation
  description              = var.kms_description
  policy                   = var.kms_policy
  key_usage                = var.kms_key_usage
  customer_master_key_spec = var.kms_customer_master_key_spec
  multi_region             = var.kms_multi_region
}

resource "aws_kms_alias" "alias" {
  name          = "alias/${var.project_name}-${var.environment}-${var.kms_scope}-key"
  target_key_id = aws_kms_key.kms.id
}
