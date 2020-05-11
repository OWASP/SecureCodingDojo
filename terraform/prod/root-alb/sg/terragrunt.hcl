# Terragrunt will copy the Terraform configurations specified by the source parameter, along with any files in the
# working directory, into a temporary folder, and execute your Terraform commands in that folder.

locals {
  vars = yamldecode(file("${find_in_parent_folders("vars.yaml")}"))

  # Global vars
  global_vars_environment  = local.vars.global.environment
  global_vars_awsAccountId = local.vars.global.awsAccountId
  global_vars_vpc          = local.vars.global.vpc
  global_vars_tags         = local.vars.global.tags

  # Local vars
  vars_namePrefix = local.vars.rootAlb.namePrefix
  vars_vpc        = lookup(local.vars.rootAlb, "vpc", local.global_vars_vpc)
  vars_tags       = lookup(local.vars.rootAlb, "tags", local.global_vars_tags)
}

terraform {
  source = "git::https://github.com/terraform-aws-modules/terraform-aws-security-group?ref=v3.8.0"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

# These are the variables we have to pass in to use the module specified in the terragrunt configuration above
inputs = {
  name                = "${local.vars_namePrefix}-${local.global_vars_environment}-ALB"
  description         = "SG for ${local.vars_namePrefix}-${local.global_vars_environment}-ALB"
  vpc_id              = local.vars_vpc
  ingress_cidr_blocks = ["0.0.0.0/0"]
  ingress_rules       = ["http-80-tcp", "https-443-tcp"],
  ingress_with_cidr_blocks = [
    {
      from_port   = 8080
      to_port     = 8080
      protocol    = "tcp"
      description = "RedBlueApp"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 8081
      to_port     = 8081
      protocol    = "tcp"
      description = "BlueTesterApp"
      cidr_blocks = "0.0.0.0/0"
    },
    {
      from_port   = 8888
      to_port     = 8888
      protocol    = "tcp"
      description = "RedBlueAppNetworkDiag"
      cidr_blocks = "0.0.0.0/0"
    }
  ],
  egress_rules = ["all-all"]
  tags         = local.vars_tags
}
