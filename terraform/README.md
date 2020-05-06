# IaC (Infrastructure as Code)
Infrastucture deployment is done using Terragrunt (wrapper for Terraform)

## Prerequisites
### Tools
The following tools needs to be installed before proceeding to the next step.
1. Terragrunt - [0.23.14](https://github.com/gruntwork-io/terragrunt/releases/download/v0.23.14/terragrunt_linux_amd64)
2. Terraform - [0.12.24](https://releases.hashicorp.com/terraform/0.12.24/terraform_0.12.24_linux_amd64.zip)

### Config
Some sensitive information is removed from the config (input) file provided to terragrunt. Add the required information to `terraform/<env>/vars.yaml`, namely
  ```
  global:
    awsAccountId: <account_id>
    vpc: <vpc_id>
    subnetIds:
      public:
        - <subnet_id1>
        - <subnet_id2>
        - <subnet_id3>
    certArn: <cert_arn>
  rootAlb:
    route53:
      parentZoneName: <parent_zone_name>
  ```

## Run
Execute a terragrunt apply which generates a plan which the user can review. This interactive command would then ask for confirmation to proceed before applying changes.

Since one module depends on the other, infrastructure creation as per the following sequence is necessary.
   ```
   cd terraform/<env>
   terragrunt apply --terragrunt-working-dir root-alb/sg
   terragrunt apply --terragrunt-working-dir root-alb/s3
   terragrunt apply --terragrunt-working-dir root-alb/alb
   terragrunt apply --terragrunt-working-dir root-alb/route53
   ```

## Other information
The current 3rd party terraform module for AWS ALB does not support adding LB listener rules.
And so, the path based routing for `/redblueapp` was added manually.

The access logs are also saved to an S3 bucket, again created using terraform.

Adding to route53 is based on an enabled flag. If enabled, it would add two aliases for your parent zone name. This parent zone name needs to be updated from within vars.yml