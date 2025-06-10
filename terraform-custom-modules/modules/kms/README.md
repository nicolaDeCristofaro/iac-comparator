# AWS KMS Module

This Terraform module provisions a fully managed AWS Key Management Service (KMS) key and alias, suitable for encrypting resources such as S3 bucket objects, EBS volumes, EKS secrets or other AWS services that support KMS encryption.

## Features

- **Creates a KMS Key**  
  - Configurable description, usage, key spec, deletion window, key rotation, and multi-region support.
  - Optionally accepts a custom key policy.

- **Creates a KMS Alias**  
  - Alias is automatically named using the pattern:  
    `alias/{project_name}-{environment}-{kms_scope}-key`

## Notes
- If no custom kms_policy is provided, AWS applies the default key policy (full access for account admins).
- Make sure to grant appropriate IAM permissions to services that need to use this key.