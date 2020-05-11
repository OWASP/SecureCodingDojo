# Terragrunt will copy the Terraform configurations specified by the source parameter, along with any files in the
# working directory, into a temporary folder, and execute your Terraform commands in that folder.

locals {
  vars = yamldecode(file("${find_in_parent_folders("vars.yaml")}"))

  # Global vars
  global_vars_region       = local.vars.global.region
  global_vars_environment  = local.vars.global.environment
  global_vars_awsAccountId = local.vars.global.awsAccountId
  global_vars_vpc          = local.vars.global.vpc
  global_vars_subnetIds    = local.vars.global.subnetIds
  global_vars_certArn      = local.vars.global.certArn
  global_vars_tags         = local.vars.global.tags

  # Internal API ALB specific vars
  vars_namePrefix         = local.vars.rootAlb.namePrefix
  vars_s3BucketPrefix     = local.vars.rootAlb.s3BucketPrefix
  vars_http2              = lookup(local.vars.rootAlb, "http2", true)
  vars_deletionProtection = lookup(local.vars.rootAlb, "deletionProtection", false)
  vars_vpc                = lookup(local.vars.rootAlb, "vpc", local.global_vars_vpc)
  vars_subnetIds          = lookup(local.vars.rootAlb, "subnetIds", local.global_vars_subnetIds.public)
  vars_tags               = lookup(local.vars.rootAlb, "tags", local.global_vars_tags)
  vars_certArn            = replace(lookup(local.vars.rootAlb, "certArn", local.global_vars_certArn), "[-awsAccountId-]", local.global_vars_awsAccountId)
}

terraform {
  source = "git::https://github.com/terraform-aws-modules/terraform-aws-alb?ref=v5.4.0"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

dependencies {
  paths = ["../s3", "../sg"]
}

dependency "s3" {
  config_path = "../s3"

  mock_outputs = {
    this_s3_bucket_id = "this_s3_bucket_id"
  }
  mock_outputs_allowed_terraform_commands = ["plan"]
}

dependency "sg" {
  config_path = "../sg"

  mock_outputs = {
    this_security_group_id = "this_security_group_id"
  }
  mock_outputs_allowed_terraform_commands = ["plan"]
}

# These are the variables we have to pass in to use the module specified in the terragrunt configuration above
inputs = {
  name    = "${local.vars_namePrefix}-${local.global_vars_environment}"
  region  = local.global_vars_region
  vpc_id  = local.vars_vpc
  subnets = local.vars_subnetIds

  access_logs = {
    bucket = dependency.s3.outputs.this_s3_bucket_id
  }

  target_groups = [
    {
      name             = "${local.vars_namePrefix}-${local.global_vars_environment}-insecureinc"
      backend_protocol = "HTTP"
      backend_port     = 8080
      target_type      = "ip"
      deregistration_delay = 30
      health_check  = {
        interval = 15
        healthy_threshold = 2
        unhealthy_threshold = 2
      }
      stickiness = {
        enable          = true
        cookie_duration = 604800
        type            = "lb_cookie"
      }
    },
    {
      name             = "${local.vars_namePrefix}-${local.global_vars_environment}-redblueapp"
      backend_protocol = "HTTP"
      backend_port     = 80
      target_type      = "ip"
      deregistration_delay = 30
      health_check  = {
        interval = 15
        healthy_threshold = 2
        unhealthy_threshold = 2
      }
    },
    {
      name             = "${local.vars_namePrefix}-${local.global_vars_environment}-redblueappnd"
      backend_protocol = "HTTP"
      backend_port     = 8888
      target_type      = "ip"
      deregistration_delay = 30
      health_check  = {
        interval = 15
        healthy_threshold = 2
        unhealthy_threshold = 2
      }
    },
    {
      name             = "${local.vars_namePrefix}-${local.global_vars_environment}-bluetesterapp"
      backend_protocol = "HTTP"
      backend_port     = 8081
      target_type      = "ip"
      deregistration_delay = 30
      health_check  = {
        interval = 15
        healthy_threshold = 2
        unhealthy_threshold = 2
      }
    }
  ]

  https_listeners = [
    {
      port               = 443
      protocol           = "HTTPS"
      certificate_arn    = local.vars_certArn
      ssl_policy         = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"
      target_group_index = 0
    },
    {
      port               = 8080
      protocol           = "HTTPS"
      certificate_arn    = local.vars_certArn
      ssl_policy         = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"
      target_group_index = 1
    },
    {
      port               = 8888
      protocol           = "HTTPS"
      certificate_arn    = local.vars_certArn
      ssl_policy         = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"
      target_group_index = 2
    },
    {
      port               = 8081
      protocol           = "HTTPS"
      certificate_arn    = local.vars_certArn
      ssl_policy         = "ELBSecurityPolicy-TLS-1-2-Ext-2018-06"
      target_group_index = 3
    }
  ]

  http_tcp_listeners = [
    {
      port        = 80
      protocol    = "HTTP"
      action_type = "redirect"
      redirect = {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  ]
  security_groups            = [dependency.sg.outputs.this_security_group_id]
  enable_http2               = local.vars_http2
  enable_deletion_protection = local.vars_deletionProtection
  tags                       = local.vars_tags
}
