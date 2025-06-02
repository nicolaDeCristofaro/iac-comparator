# AWS Networking Module

This Terraform module provisions a complete AWS VPC-based networking setup. It is designed to be flexible and supports optional Multi-AZ NAT gateways, VPC interface and gateway endpoints, and subnet and route table configurations.

## Features

- **Creates a VPC**
  - Configurable CIDR block, DNS hostnames, and DNS support.

- **Creates Public and Private Subnets**
  - Subnets distributed across multiple Availability Zones.

- **Creates Internet Gateway and Route Tables**
  - Public route tables for internet access.
  - Private route tables with NAT gateway routing.

- **Creates NAT Gateways**
  - Deploys NAT gateways in multiple Availability Zones (optionally) using Elastic IPs.

- **Creates VPC Endpoints (Optional)**
  - Gateway Endpoint for S3.
  - Interface Endpoints for:
    - ECR (Docker and API)
    - SSM, SSM Messages
    - EC2 Messages

## Notes

- If `enable_multi_az_nat` is set to `true`, it is created a NAT Gateway for each AZ used. For example, if 3 public/private subnet couples are used, and the variable `enable_multi_az_nat` is set to `true`, 3 NAT Gateways will be created in each public subnets with Elastic IP and for each private subnet there will be a route table including a route to that specific NAT.
- VPC endpoints are created only if their respective `enable_*` variables are set to `true`.