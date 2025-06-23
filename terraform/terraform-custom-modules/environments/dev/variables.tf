################################################################################
# GENERAL
################################################################################
variable "aws_region" {
  description = "The AWS region where resources will be created"
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "A unique identifier for the project. It helps in distinguishing resources associated with this project from others"
  type        = string
}

variable "environment" {
  description = "Defines the deployment environment, such as 'dev' or 'prod'"
  type        = string
}

################################################################################
# KMS
################################################################################
variable "kms_scope" {
  description = "The scope or purpose of the KMS Key created (used to compose the alias)"
  type        = string
}

variable "kms_description" {
  description = "The description of the key as viewed in AWS console"
  type        = string
}

variable "kms_deletion_window_in_days" {
  description = "Duration in days after which the key is deleted after destruction of the resource"
  type        = number
  default     = 10
}

variable "kms_enable_key_rotation" {
  description = "Specifies whether key rotation is enabled"
  type        = bool
  default     = true
}

#If a key policy is not specified, AWS gives the KMS key a default key policy that gives all principals in the owning account unlimited access to all KMS operations for the key. This default key policy effectively delegates all access control to IAM policies and KMS grants.
variable "kms_policy" {
  description = "A valid KMS policy JSON document. Note that if the policy document is not specific enough (but still valid), Terraform may view the policy as constantly changing in a terraform plan. In this case, please make sure you use the verbose/specific version of the policy"
  type        = string
  default     = ""
}

variable "kms_key_usage" {
  description = "Specifies the intended use of the key. Valid values: `ENCRYPT_DECRYPT` or `SIGN_VERIFY`"
  type        = string
  default     = "ENCRYPT_DECRYPT"
}

variable "kms_customer_master_key_spec" {
  description = "Specifies whether the key contains a symmetric key or an asymmetric key pair and the encryption algorithms or signing algorithms that the key supports. Valid values: `SYMMETRIC_DEFAULT`, `RSA_2048`, `RSA_3072`, `RSA_4096`, `ECC_NIST_P256`, `ECC_NIST_P384`, `ECC_NIST_P521`, or `ECC_SECG_P256K1`"
  type        = string
  default     = "SYMMETRIC_DEFAULT"
}

variable "kms_multi_region" {
  description = "Indicates whether the KMS key is a multi-Region (true) or regional (false) key"
  type        = bool
  default     = false
}

################################################################################
# NETWORKING
################################################################################
variable "vpc_cidr" {
  description = "The CIDR block for the Virtual Private Cloud (VPC) that will be created for the project. It specifies the range of IP addresses for the VPC"
  type        = string
}

variable "enable_multi_az_nat" {
  description = "A boolean flag to indicate if multi-AZ NAT Gateway is enabled. If true, multiple NAT Gateways will be created in different availability zones"
  type        = bool
  default     = false
}

variable "private_subnets_cidr" {
  description = "A list of CIDR blocks for the compute private subnets within the VPC"
  type        = list(string)
}

variable "public_subnets_cidr" {
  description = "A list of CIDR blocks for the public subnets within the VPC"
  type        = list(string)
}

variable "vpc_endpoint_subnet_cidrs" {
  description = "A list of CIDR blocks for the vpc endpoint subnets within the VPC"
  type        = list(string)
}

variable "enable_s3_gateway_vpc_endpoint" {
  description = "Whether to create a gateway VPC endpoint for Amazon S3"
  type        = bool
  default     = false
}

variable "enable_multi_az_vpc_interface_endpoint" {
  description = "A boolean flag to indicate if multi-AZ VPC interface endpoints are enabled. If true, multiple interface endpoints will be created in different availability zones. One ENI per subnet (thus, per AZ)."
  type        = bool
  default     = false
}

variable "enable_ecr_dkr_interface_vpc_endpoint" {
  description = "Whether to create an interface VPC endpoint for Amazon ECR Docker"
  type        = bool
  default     = false
}

variable "enable_ecr_api_interface_vpc_endpoint" {
  description = "Whether to create an interface VPC endpoint for Amazon ECR API"
  type        = bool
  default     = false
}

variable "enable_ssm_interface_vpc_endpoint" {
  description = "Whether to create an interface VPC endpoint for AWS Systems Manager (SSM)"
  type        = bool
  default     = false
}

variable "enable_ssm_messages_interface_vpc_endpoint" {
  description = "Whether to create an interface VPC endpoint for AWS Systems Manager Messages"
  type        = bool
  default     = false
}

variable "enable_ec2_messages_interface_vpc_endpoint" {
  description = "Whether to create an interface VPC endpoint for EC2 messages used by SSM"
  type        = bool
  default     = false
}
