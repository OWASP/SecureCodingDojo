# Terragrunt will copy the Terraform configurations specified by the source parameter, along with any files in the
# working directory, into a temporary folder, and execute your Terraform commands in that folder.

locals {
  vars = yamldecode(file("${find_in_parent_folders("vars.yaml")}"))

  # Global vars
  global_vars_awsAccountId = local.vars.global.awsAccountId
  global_vars_tags         = local.vars.global.tags

  # Local vars
  vars_s3BucketPrefix = local.vars.rootAlb.s3BucketPrefix
  vars_tags           = lookup(local.vars.rootAlb, "tags", local.global_vars_tags)
}

terraform {
  source = "git::https://github.com/terraform-aws-modules/terraform-aws-s3-bucket?ref=v1.6.0"
}

# Include all settings from the root terragrunt.hcl file
include {
  path = find_in_parent_folders()
}

# These are the variables we have to pass in to use the module specified in the terragrunt configuration above
inputs = {
  bucket                         = "${local.vars_s3BucketPrefix}-${local.global_vars_awsAccountId}"
  acl                            = "log-delivery-write"
  attach_elb_log_delivery_policy = true
  tags                           = local.vars_tags
}
