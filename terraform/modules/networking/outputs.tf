output "vpc_id" {
  description = "ID of the Virtual Private Cloud (VPC)"
  value       = aws_vpc.vpc.id
}

output "igw_id" {
  description = "ID of the Internet Gateway associated with the VPC"
  value       = aws_internet_gateway.igw.id
}

output "natgw_id" {
  description = "IDs of the NAT Gateways providing internet access for private subnets"
  value       = aws_nat_gateway.natgw.*.id
}

output "natgw_eip" {
  description = "Elastic IPs associated with the NAT Gateways"
  value       = aws_nat_gateway.natgw.*.public_ip
}

output "private_subnets" {
  description = "IDs and CIDRs of the private subnets"
  value = {
    ids   = aws_subnet.private_subnets.*.id
    cidrs = aws_subnet.private_subnets.*.cidr_block
  }
}

output "public_subnets" {
  description = "IDs and CIDRs of the public subnets"
  value = {
    ids   = aws_subnet.public_subnets.*.id
    cidrs = aws_subnet.public_subnets.*.cidr_block
  }
}
