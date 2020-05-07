# Configure Terragrunt to automatically store tfstate files in an S3 bucket
locals {
  vars = yamldecode(file("vars.yaml"))
}

remote_state {
  backend = "s3"

  config = {
    encrypt        = true
    bucket         = join("-", ["terraform-states", local.vars.global.region, local.vars.global.awsAccountId])
    key            = join("/", [local.vars.global.environment, path_relative_to_include(), "terraform.tfstate"])
    region         = local.vars.global.region
    dynamodb_table = "terraform-locks" # shared within a region
  }
}

# Configure root level variables that all resources can inherit. This is especially helpful with multi-account configs
# where terraform_remote_state data sources are placed directly into the modules.
inputs = {
  aws_region                   = local.vars.global.region
  tfstate_global_bucket        = join("-", ["terraform-states", local.vars.global.region, local.vars.global.awsAccountId])
  tfstate_global_bucket_region = local.vars.global.region
}
