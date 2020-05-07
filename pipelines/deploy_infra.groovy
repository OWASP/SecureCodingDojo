properties([
  parameters([
    choiceParam(name: 'TERRAGRUNT_ACTION', choices: "plan\napply", description: 'Terragrunt action'),
    text(name: 'TERRAGRUNT_ROOTS', defaultValue: '''root-alb/sg\nroot-alb/s3\nroot-alb/alb\nroot-alb/route53\n''',
    description: 'The folders that Terragrunt will traverse that exist under terraform/<env>')
  ])
])

def tfNode = 'tf_node_secure-coding-dojo'

node(tfNode){
  try {
    def environment = "prod"
    def region = "us-east-2"
    def versionTerraform = "0.12.24"
    def versionTerragrunt = "v0.23.14"
    def terragruntPath = "${WORKSPACE}/terraform"
    def commands = []

    stage("Checkout source"){
      echo "Checkout source..."
      checkout scm
    } // stage

    stage("Get secret vars from AWS SM") {
      echo "Get additional vars (sensitive information) from secretsmanager..."
      dir("${terragruntPath}/${environment}") {
        sh "aws secretsmanager --region ${region} get-secret-value --secret-id 'terragrunt-${environment}-vars.yaml' --query SecretString --output text > vars_additional.yaml"
        docker.image("mikefarah/yq").inside(){
          sh "yq m -i vars.yaml vars_additional.yaml"
        } // docker.image
      } // dir
    } // stage

    stage("Construct terragrunt commands"){
      params.TERRAGRUNT_ROOTS.split().each { item ->
        def extra_args = ""
        if ("${params.TERRAGRUNT_ACTION}" == 'plan') {
          def outfilepath = "${item}.plan".replace('/','_')
          extra_args = "-out=${terragruntPath}/${outfilepath}.output -detailed-exitcode"
        }
        else if ("${params.TERRAGRUNT_ACTION}" == 'apply') {
          // terragrunt apply with --terragrunt-non-interactive does not pass the below extra args to the underlying terraform by default.
          extra_args = "-input=false -auto-approve"
        } // if
        commands.add("terragrunt ${params.TERRAGRUNT_ACTION} --terragrunt-working-dir ${terragruntPath}/${environment}/${item} --terragrunt-non-interactive ${extra_args}")
      } // params.each
    } // stage

    stage("Do terragrunt action"){
      docker.image("alpine/terragrunt:${versionTerraform}").inside("-u 0"){
        sh "wget -q https://github.com/gruntwork-io/terragrunt/releases/download/${versionTerragrunt}/terragrunt_linux_amd64 -O /usr/local/bin/terragrunt"
        commands.each { command ->
          sh "echo Command: ${command}"
          wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
            def status = sh(returnStatus: true, script: "${command}")
            if (status == 0) {
              echo "Command ran successfully."
            }
            // Status of 2 indicates non-empty diff [Ref: https://www.terraform.io/docs/commands/plan.html]
            else if (status == 2 && params.TERRAGRUNT_ACTION == 'plan') {
              echo "Drift detected."
              // Get filename of the terraform output and replace ''.output' to '.drift'
              def driftfilepath = command.split().find{ it =~ '-out=' }.split('=')[-1].split('/')[-1].replace('.output','.drift')
              writeFile(file:"${driftfilepath}", text:'true')
            }
            else {
              throw "Action ${params.TERRAGRUNT_ACTION} failed with status ${status}"
            } // if
          } // wrap
        } // commands.each
      } // docker.image
    } // stage

    stage ('Archive artifacts'){
      if (params.TERRAGRUNT_ACTION == 'plan') {
        sh "find ${terragruntPath} -name '*.output' -exec cp {} ${WORKSPACE} \\;"
        archiveArtifacts "*.output,*.drift"
      } // end of scriptedWhen
    } // end of stage
  } // try
  finally {
    sh "sudo find . -type d -name '.terragrunt-cache' -prune -exec rm -rf {} \\;"
    deleteDir()
  } // finally
} // node