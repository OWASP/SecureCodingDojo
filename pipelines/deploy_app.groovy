def tfNode = 'tf_node_secure-coding-dojo'

node(tfNode){
  // Global vars
  def awsAccountID = sh(returnStdout: true, script: "aws sts get-caller-identity --query Account --output text").trim()
  def awsRegion = 'us-east-2'

  // ECR vars
  def ecrRegistry = "${awsAccountID}.dkr.ecr.${awsRegion}.amazonaws.com"
  def ecrRepoName = "securecodingdojo/redblueapp"
  def ecrImageTag = "latest"
  def ecrImageURI = "${ecrRegistry}/${ecrRepoName}:${ecrImageTag}"

  // ECS vars
  def ecsCluster = "arn:aws:ecs:${awsRegion}:${awsAccountID}:cluster/InsecureInc"
  def ecsServiceName = "RedBlueApp"

  try {
    stage("Checkout source"){
      echo "Checkout source..."
      checkout scm
    }

    stage("Build image and push to ECR") {
      echo "Build and push image to ECR..."
      sh(returnStdout: true, script: "aws ecr get-login --no-include-email --region '${awsRegion}' --registry-ids '${awsAccountID}'")
      dir("redblueapp"){
        docker.withRegistry("https://${ecrRegistry}") {
          dockerImage = docker.build(ecrImageURI, "-f Dockerfile .")
          dockerImage.push()
        }
      }
    } // stage

    stage("Deploy to ECS"){
      echo "Deploying to ECS..."
      // Assumes a service and task definition has already been created in the InsecureInc cluster.
      // Therefore only need to update the service using --force-new-deployment option to use latest image with same name
      // If your updated Docker image uses the same tag as what is in the existing task definition for your service 
      // (for example, my_image:latest ), you do not need to create a new revision of your task definition. You can update 
      // the service using the force-new-deployment option. The new tasks launched by the deployment pull the current image/tag 
      // combination from your repository when they start.
      sh(returnStdout: true, script: "aws ecs --region ${awsRegion} update-service --cluster ${ecsCluster} --service ${ecsServiceName} --force-new-deployment")
    } // stage
  } // try
  finally {
    deleteDir()
  } // finally
} // node