# Retrieves the available AZs in the specified AWS region
data "aws_availability_zones" "available" {}

################################################################################
# VPC & GW
################################################################################
resource "aws_vpc" "vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

resource "aws_eip" "natgw_eip" {
  count = var.enable_multi_az_nat ? length(var.private_subnets_cidr) : 1

  domain = "vpc"

  tags = {
    Name = var.enable_multi_az_nat ? "${var.project_name}-${var.environment}-natgw-eip-${element(data.aws_availability_zones.available.names, count.index)}" : "${var.project_name}-${var.environment}-natgw-eip"
  }

  depends_on = [aws_internet_gateway.igw]
}

resource "aws_nat_gateway" "natgw" {
  count = var.enable_multi_az_nat ? length(var.private_subnets_cidr) : 1

  allocation_id = aws_eip.natgw_eip[count.index].allocation_id
  subnet_id     = aws_subnet.public_subnets[count.index].id

  tags = {
    Name = var.enable_multi_az_nat ? "${var.project_name}-${var.environment}-nat-${element(data.aws_availability_zones.available.names, count.index)}" : "${var.project_name}-${var.environment}-nat"
  }

  depends_on = [aws_internet_gateway.igw]
}

################################################################################
# ROUTE TABLES
################################################################################
resource "aws_route_table" "priv_rt" {
  count = length(var.private_subnets_cidr)

  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "${var.project_name}-${var.environment}-private-rtb-${element(data.aws_availability_zones.available.names, count.index)}"
  }
}

resource "aws_route_table" "pub_rt" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name = "${var.project_name}-${var.environment}-public-rtb"
  }
}

resource "aws_default_route_table" "default" {
  default_route_table_id = aws_vpc.vpc.default_route_table_id

  route {
    cidr_block = var.vpc_cidr
    gateway_id = "local"
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-default"
  }
}

################################################################################
# SUBNETS & RT ASSOCIATIONS
################################################################################
resource "aws_subnet" "private_subnets" {
  count = length(var.private_subnets_cidr)

  vpc_id     = aws_vpc.vpc.id
  cidr_block = var.private_subnets_cidr[count.index]

  availability_zone = element(data.aws_availability_zones.available.names, count.index)

  tags = {
    Name = "${var.project_name}-${var.environment}-private-sbn-${element(data.aws_availability_zones.available.names, count.index)}"
  }
}

resource "aws_route_table_association" "rt_assoc_priv_subnets" {
  count = length(var.private_subnets_cidr)

  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.priv_rt[count.index].id
}

resource "aws_subnet" "public_subnets" {
  count = length(var.public_subnets_cidr)

  vpc_id     = aws_vpc.vpc.id
  cidr_block = var.public_subnets_cidr[count.index]

  availability_zone = element(data.aws_availability_zones.available.names, count.index)

  tags = {
    Name = "${var.project_name}-${var.environment}-public-sbn-${element(data.aws_availability_zones.available.names, count.index)}"
  }
}

resource "aws_route_table_association" "rt_assoc_pub_subnets" {
  count = length(var.public_subnets_cidr)

  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.pub_rt.id
}

resource "aws_subnet" "vpc_endpoint" {
  count = length(var.vpc_endpoint_subnet_cidrs)

  vpc_id     = aws_vpc.vpc.id
  cidr_block = var.vpc_endpoint_subnet_cidrs[count.index]

  availability_zone = element(data.aws_availability_zones.available.names, count.index)

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc-endpoint-sbn-${element(data.aws_availability_zones.available.names, count.index)}"
  }
}
resource "aws_route_table_association" "vpc_endpoint" {
  count = length(var.vpc_endpoint_subnet_cidrs)

  subnet_id      = aws_subnet.vpc_endpoint[count.index].id
  route_table_id = aws_default_route_table.default.id
}

################################################################################
# ROUTES
################################################################################
resource "aws_route" "private" {
  count = length(var.private_subnets_cidr)

  route_table_id         = aws_route_table.priv_rt[count.index].id
  nat_gateway_id         = var.enable_multi_az_nat ? aws_nat_gateway.natgw[count.index].id : aws_nat_gateway.natgw[0].id
  destination_cidr_block = "0.0.0.0/0"

  depends_on = [aws_nat_gateway.natgw]
}

resource "aws_route" "public" {
  route_table_id         = aws_route_table.pub_rt.id
  gateway_id             = aws_internet_gateway.igw.id
  destination_cidr_block = "0.0.0.0/0"

  depends_on = [aws_internet_gateway.igw]
}

##################################################
## VPC Endpoint (gateway)
##################################################
resource "aws_vpc_endpoint" "s3" {
  count = var.enable_s3_gateway_vpc_endpoint ? 1 : 0

  vpc_id            = aws_vpc.vpc.id
  service_name      = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type = "Gateway"

  tags = {
    "Name" = "s3"
  }
}

resource "aws_vpc_endpoint_route_table_association" "private" {
  count = var.enable_s3_gateway_vpc_endpoint ? length(var.private_subnets_cidr) : 0

  vpc_endpoint_id = aws_vpc_endpoint.s3[0].id
  route_table_id  = aws_route_table.priv_rt[count.index].id
}

##################################################
## VPC Endpoint (interface)
##################################################
locals {
  enable_vpc_interface_endpoint = var.enable_ecr_dkr_interface_vpc_endpoint || var.enable_ecr_api_interface_vpc_endpoint || var.enable_ssm_interface_vpc_endpoint || var.enable_ssm_messages_interface_vpc_endpoint || var.enable_ec2_messages_interface_vpc_endpoint
}

resource "aws_security_group" "vpc_endpoint" {
  count = local.enable_vpc_interface_endpoint ? 1 : 0

  name        = "${var.project_name}-${var.environment}-interface-vpc-endpoint"
  description = "Security group for VPC Interface Endpoints"
  vpc_id      = aws_vpc.vpc.id

  tags = {
    Name = "${var.project_name}-${var.environment}-interface-vpc-endpoint"
  }
}
resource "aws_security_group_rule" "vpc_endpoint_ingress" {
  count = local.enable_vpc_interface_endpoint ? 1 : 0

  security_group_id = aws_security_group.vpc_endpoint[0].id
  type              = "ingress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = [var.vpc_cidr]
}

resource "aws_security_group_rule" "vpc_endpoint_egress" {
  count = local.enable_vpc_interface_endpoint ? 1 : 0

  security_group_id = aws_security_group.vpc_endpoint[0].id
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = [var.vpc_cidr]
}

resource "aws_vpc_endpoint" "ecr_dkr" {
  count = var.enable_ecr_dkr_interface_vpc_endpoint ? 1 : 0

  vpc_id            = aws_vpc.vpc.id
  service_name      = "com.amazonaws.${var.aws_region}.ecr.dkr"
  vpc_endpoint_type = "Interface"

  security_group_ids = [aws_security_group.vpc_endpoint[0].id]
  subnet_ids         = aws_subnet.vpc_endpoint.*.id

  private_dns_enabled = true

  tags = {
    "Name" = "ecr-dkr"
  }
}

resource "aws_vpc_endpoint" "ecr_api" {
  count = var.enable_ecr_api_interface_vpc_endpoint ? 1 : 0

  vpc_id            = aws_vpc.vpc.id
  service_name      = "com.amazonaws.${var.aws_region}.ecr.api"
  vpc_endpoint_type = "Interface"

  security_group_ids = [aws_security_group.vpc_endpoint[0].id]
  subnet_ids         = aws_subnet.vpc_endpoint.*.id

  private_dns_enabled = true

  tags = {
    "Name" = "ecr-api"
  }
}

resource "aws_vpc_endpoint" "ssm" {
  count = var.enable_ssm_interface_vpc_endpoint ? 1 : 0

  vpc_id            = aws_vpc.vpc.id
  service_name      = "com.amazonaws.${var.aws_region}.ssm"
  vpc_endpoint_type = "Interface"

  security_group_ids = [aws_security_group.vpc_endpoint[0].id]
  subnet_ids         = aws_subnet.vpc_endpoint.*.id

  private_dns_enabled = true

  tags = {
    "Name" = "ssm"
  }
}

resource "aws_vpc_endpoint" "ssmmessages" {
  count = var.enable_ssm_messages_interface_vpc_endpoint ? 1 : 0

  vpc_id            = aws_vpc.vpc.id
  service_name      = "com.amazonaws.${var.aws_region}.ssmmessages"
  vpc_endpoint_type = "Interface"

  security_group_ids = [aws_security_group.vpc_endpoint[0].id]
  subnet_ids         = aws_subnet.vpc_endpoint.*.id

  private_dns_enabled = true

  tags = {
    "Name" = "ssmmessages"
  }
}

resource "aws_vpc_endpoint" "ec2messages" {
  count = var.enable_ec2_messages_interface_vpc_endpoint ? 1 : 0

  vpc_id            = aws_vpc.vpc.id
  service_name      = "com.amazonaws.${var.aws_region}.ec2messages"
  vpc_endpoint_type = "Interface"

  security_group_ids = [aws_security_group.vpc_endpoint[0].id]
  subnet_ids         = aws_subnet.vpc_endpoint.*.id

  private_dns_enabled = true

  tags = {
    "Name" = "ec2messages"
  }
}
