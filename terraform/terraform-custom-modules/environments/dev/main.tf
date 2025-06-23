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

module "networking" {
  source = "../../modules/networking"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  vpc_cidr                  = var.vpc_cidr
  public_subnets_cidr       = var.public_subnets_cidr
  private_subnets_cidr      = var.private_subnets_cidr
  vpc_endpoint_subnet_cidrs = var.vpc_endpoint_subnet_cidrs
  enable_multi_az_nat       = var.enable_multi_az_nat

  enable_s3_gateway_vpc_endpoint             = var.enable_s3_gateway_vpc_endpoint
  enable_multi_az_vpc_interface_endpoint     = var.enable_multi_az_vpc_interface_endpoint
  enable_ecr_dkr_interface_vpc_endpoint      = var.enable_ecr_dkr_interface_vpc_endpoint
  enable_ecr_api_interface_vpc_endpoint      = var.enable_ecr_api_interface_vpc_endpoint
  enable_ssm_interface_vpc_endpoint          = var.enable_ssm_interface_vpc_endpoint
  enable_ssm_messages_interface_vpc_endpoint = var.enable_ssm_messages_interface_vpc_endpoint
  enable_ec2_messages_interface_vpc_endpoint = var.enable_ec2_messages_interface_vpc_endpoint
}
