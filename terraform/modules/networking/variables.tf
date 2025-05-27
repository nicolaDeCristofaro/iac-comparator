variable "project_name" {
  description = "A unique identifier for the project. It helps in distinguishing resources associated with this project from others"
  type        = string
}

variable "environment" {
  description = "Defines the deployment environment, such as 'dev' or 'prod'"
  type        = string
}

variable "aws_region" {
  description = "The AWS region where resources will be created"
  type        = string
}

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
