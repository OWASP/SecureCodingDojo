# Terragrunt will copy the Terraform configurations specified by the source parameter, along with any files in the
# working directory, into a temporary folder, and execute your Terraform commands in that folder.

locals {
  vars = yamldecode(file("${find_in_parent_folders("vars.yaml")}"))

  # Global vars
  global_vars_region = local.vars.global.region

  # Route53 specific vars
  vars_route53                = lookup(local.vars.rootAlb, "route53", {})
  vars_route53_enabled        = lookup(local.vars_route53, "enabled", true)
  vars_route53_aliases        = lookup(local.vars_route53, "aliases", [])
  vars_route53_parentZoneName = lookup(local.vars_route53, "parentZoneName", "")
}

terraform {
  source = "git::https://github.com/cloudposse/terraform-aws-route53-alias?ref=0.6.0"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

dependencies {
  paths = ["../alb"]
}

dependency "alb" {
  config_path = "../alb"

  mock_outputs = {
    this_lb_zone_id  = "this_lb_zone_id"
    this_lb_dns_name = "this_lb_dns_name"
  }
  mock_outputs_allowed_terraform_commands = ["plan"]
}

# These are the variables we have to pass in to use the module specified in the terragrunt configuration above
inputs = {
  enabled          = local.vars_route53_enabled
  aliases          = local.vars_route53_aliases
  parent_zone_name = local.vars_route53_parentZoneName
  target_zone_id   = dependency.alb.outputs.this_lb_zone_id
  target_dns_name  = dependency.alb.outputs.this_lb_dns_name
}
