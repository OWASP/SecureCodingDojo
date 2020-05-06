terraform {
  # Intentionally empty. Will be filled by Terragrunt.
  backend "s3" {}
}

variable "aws_region" {
  description = ""
}

provider "aws" {
  #user should already be connected with jenkins credentials
  #only the region should be provided
  region  = var.aws_region
  version = "~> 2.0"
}