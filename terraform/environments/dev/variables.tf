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
# S3
################################################################################
variable "bucket_scopes" {
  description = "List of string containing the scope of each S3 bucket (for naming purposes)"
  type        = list(string)
}

variable "bucket_options" {
  type = map(object({
    cors_rules = object({
      allowed_methods = list(string)
      allowed_origins = list(string)
      allowed_headers = list(string)
      expose_headers  = list(string)
    })
  }))
  description = "Map of bucket configurations with scope and optional CORS settings"
  default     = null
}

variable "days_to_abort_incomplete_multipart_upload" {
  description = "Number of days after which Amazon S3 aborts an incomplete multipart upload"
  type        = number
  default     = null
}

################################################################################
# GitHub Actions IAM ROLE
################################################################################
variable "github_org_name" {
  description = "GitHub Organization Name"
  type        = string
}

################################################################################
# Networking
################################################################################
variable "vpc_cidr" {
  description = "The CIDR block for the Virtual Private Cloud (VPC) that will be created for the project. It specifies the range of IP addresses for the VPC"
  type        = string
}

variable "compute_private_subnets_cidr" {
  description = "A list of CIDR blocks for the compute private subnets within the VPC"
  type        = list(string)
}

variable "ml_private_subnets_cidr" {
  description = "A list of CIDR blocks for the ml private subnets within the VPC"
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

variable "mongodb_atlas_service_name" {
  description = "The name of the MongoDB Atlas service for creating the VPC Endpoint"
  type        = string
  default     = ""
}

################################################################################
# EKS Cluster
################################################################################
variable "eks_version" {
  description = "Desired Kubernetes version"
  type        = string
}

variable "eks_endpoint_public_access" {
  description = "Whether the Amazon EKS public API server endpoint is enabled"
  type        = bool
}

variable "eks_endpoint_private_access" {
  description = "Whether the Amazon EKS private API server endpoint is enabled"
  type        = bool
}

################################################################################
# EKS Addons & Controller
################################################################################
variable "addon_coredns_version" {
  description = "The version of the EKS coredns add-on"
  type        = string
}

variable "addon_kubeproxy_version" {
  description = "The version of the EKS kubeproxy add-on"
  type        = string
}

variable "addon_vpccni_version" {
  description = "The version of the EKS vpccni add-on"
  type        = string
}

variable "aws_loadbalancer_controller_version" {
  description = "The AWS Loadbalancer Controller Helm chart version"
  type        = string
  default     = null
}

variable "efs_csi_driver_version" {
  description = "The version of the EKS efs_csi_driver add-on"
  type        = string
  default     = null
}

variable "ebs_csi_driver_version" {
  description = "The version of the EKS ebs_csi_driver add-on"
  type        = string
  default     = null
}

################################################################################
# EKS Nodegroups
################################################################################
variable "nodegroups" {
  description = "Description of EKS Nodegroups characteristics"
  type = map(object({
    name : string
    disk_size : number # GiB - Default 50 for Windows, 20 for other node groups
    instance_types : list(string)
    scaling_config : object({
      desired_size = number
      min_size     = number
      max_size     = number
    })
    capacity_type : string # Valid values: ON_DEMAND, SPOT
    ami_type : string
    update_config : map(string)
    taints : list(object({
      key    = string
      value  = optional(string)
      effect = string
    }))
    labels : map(string)
  }))
}

################################################################################
# EFS
################################################################################
variable "efs_encrypted" {
  description = "Whether the EFS is encrypted"
  type        = string
}

variable "efs_throughput_mode" {
  description = "Throughput mode for the file system. Defaults to bursting. Valid values: 'bursting', 'provisioned', 'elastic'. When using 'provisioned', also set 'provisioned_throughput_in_mibps'"
  type        = string
}

variable "efs_performance_mode" {
  description = "The file system performance mode. Can be either 'generalPurpose' or 'maxIO'"
  type        = string
}

variable "efs_transition_to_primary_storage_class" {
  description = "Describes the policy used to transition a file from Infrequent Access (IA) storage to primary storage. Valid values: AFTER_1_ACCESS"
  type        = list(string)
}

variable "efs_transition_to_ia" {
  description = "Indicates how long it takes to transition files to the Infrequent Access (IA) storage class. Valid values: AFTER_1_DAY, AFTER_7_DAYS, AFTER_14_DAYS, AFTER_30_DAYS, AFTER_60_DAYS and AFTER_90_DAYS. Default (no value) means \"never\""
  type        = list(string)
}

################################################################################
# Developers EC2
################################################################################
variable "ec2" {
  description = "Description of Developers EC2 characteristics"
  type = map(object({
    scope : string
    instance_type : string
    ami_id : string
    user_data : optional(string)
    volume_size : number
    az : string
    additional_tags : optional(map(string))
    auto_stop_low_cpu : optional(object({
      create                     = bool
      evaluation_period          = number
      threshold                  = number
      stop_action_enabled        = bool
      email_notification_enabled = bool
    }))
  }))
}

variable "sns_alarm_topic_email_to_notify" {
  description = "List of email addresses to notify when an alarm is triggered"
  type        = list(string)
  default     = []
}

################################################################################
# ACM Certificate
################################################################################
variable "domain_name" {
  description = "Domain Name for the certificate in ACM"
  type        = string
}

variable "domain_alternative_names" {
  description = "Domain Alternative Names for the certificate in ACM"
  type        = list(string)
  default     = []
}

################################################################################
# WAF for Backend
################################################################################
variable "waf_backend" {
  description = "Configuration for WAF Web ACL for CloudFront Backend"
  type = object({
    scope              = string
    target             = string
    description        = string
    metric_name        = string
    logging_enabled    = bool
    log_retention_days = number
    rate_limit = object({
      enabled = bool
      limit   = number
      period  = number
    })
    rules = list(object({
      name        = string
      priority    = number
      rule_name   = string
      vendor_name = string
      metric_name = string
      rule_action_override = optional(list(object({
        name  = string
        count = bool
      })))
    }))
  })
}

################################################################################
# CloudFront
################################################################################
variable "lb_dns_name" {
  description = "The DNS name of the Load Balancer as CloudFront origin"
  type        = string
}

variable "cloudfront_domain_alternative_names" {
  description = "Domain Alternative Names for the CloudFront"
  type        = list(string)
  default     = []
}

variable "cloudfront_origin_read_timeout" {
  description = "The maximum duration that you want CloudFront to wait for a response to origin (seconds)"
  type        = number
  default     = 30
}

################################################################################
# WAF for Frontend
################################################################################
variable "waf_frontend" {
  description = "Configuration for WAF Web ACL for CloudFront Frontend"
  type = object({
    scope              = string
    target             = string
    description        = string
    metric_name        = string
    logging_enabled    = bool
    log_retention_days = number
    rate_limit = object({
      enabled = bool
      limit   = number
      period  = number
    })
    rules = list(object({
      name        = string
      priority    = number
      rule_name   = string
      vendor_name = string
      metric_name = string
      rule_action_override = optional(list(object({
        name  = string
        count = bool
      })))
    }))
  })
}

################################################################################
# CloudFront + S3 for frontend
################################################################################
variable "frontend_cloudfront_domain_alternative_names" {
  description = "Domain Alternative Names for the frontend CloudFront"
  type        = list(string)
  default     = []
}

variable "frontend_cloudfront_default_root_object" {
  description = "Object that you want CloudFront to return (for example, index.html) when an end user requests the root URL"
  type        = string
  default     = ""
}

################################################################################
# AWS Budget
################################################################################
variable "budget_scope" {
  description = "The scope of the budget to create (used for naming purposes)."
  type        = string
}

variable "budget_limit_amount" {
  description = "The maximum spend limit for the budget in USD."
  type        = number
}

variable "budget_threshold_percent" {
  description = "The percentage threshold at which to trigger alerts (0-100)."
  type        = number
  default     = 100
}

variable "budget_time_unit" {
  description = "The time unit for the budget (e.g., MONTHLY, DAILY)."
  type        = string
  default     = "MONTHLY"
}

variable "budget_alert_emails" {
  description = "List of email addresses to notify when the budget threshold is exceeded."
  type        = list(string)
  default     = ["ops@example.com"]
}

variable "budget_enforcement_mode" {
  description = "The enforcement mode to use when the budget is exceeded (APPLY_IAM_POLICY, APPLY_SCP_POLICY or NONE)." # right now only IAM policy is supported because SCP is only available in the parent account where AWS Organizations is located
  type        = string
  default     = "NONE"
}
