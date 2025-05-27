output "key_arn" {
  value       = aws_kms_key.kms.arn
  description = "KMS Key ARN"
}

output "key_id" {
  value       = aws_kms_key.kms.key_id
  description = "KMS Key ID"
}

output "alias_name" {
  value       = aws_kms_alias.alias.name
  description = "KMS Alias name"
}
