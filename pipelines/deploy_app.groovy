def tfNode = 'tf_node_secure-coding-dojo'

node(tfNode){
  def awsAccountID = sh(returnStdout: true, script: "aws sts get-caller-identity --query Account --output text").trim()
  def awsRegion = 'us-east-2'  
  def ecrRegistry = "${awsAccountID}.dkr.ecr.${awsRegion}.amazonaws.com"
  def ecrRepoName = "securecodingdojo/redblueapp"
  def ecrImageTag = "latest"
  def ecrImageURI = "${ecrRegistry}/${ecrRepoName}:${ecrImageTag}"

  stage("Build image and push to ECR") {
    echo "Pushing image to ECR..."
    sh "set +x; \$(aws ecr get-login --no-include-email --region '${awsRegion}' --registry-ids '${awsAccountID}'); set -x"
    docker.withRegistry(ecrRegistry) {
      docker.build(ecrImageURI, "-f securecodingdojo/redblueapp/Dockerfile .")
      docker.image(ecrImageURI).push(ecrImageTag)
    }
  }
  stage("Deploy to ECS"){
    echo "Deploying to ECS..."
  }
}
