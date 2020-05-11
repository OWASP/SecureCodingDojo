
def tfNode = 'tf_node_secure-coding-dojo'

node(tfNode){
  properties([
    pipelineTriggers([
      cron('0 18 * * *') // Run at 6pm everyday.
    ])
  ])

  // Global vars
  def awsAccountID = sh(returnStdout: true, script: "aws sts get-caller-identity --query Account --output text").trim()
  def awsRegion = 'us-east-2'

  // ECS/ECR vars
  def ecsCluster = "arn:aws:ecs:${awsRegion}:${awsAccountID}:cluster/InsecureInc-EC2"
  def ecrRegistry = "${awsAccountID}.dkr.ecr.${awsRegion}.amazonaws.com"
  
  def apps = [
    "insecureinc": [
      ecrRepoName : "securecodingdojo/insecure.inc",
      ecrImageTag: "latest",
      ecsServiceNames: [
        "InsecureInc"
      ],
      dockerfileDir: "build/insecureinc"
    ],
    "redblueapp": [
      ecrRepoName : "securecodingdojo/redblueapp",
      ecrImageTag: "latest",
      ecsServiceNames: [
        "RedBlueApp",
        "RedBlueAppNetworkDiag"
      ],
      dockerfileDir: "redblueapp"
    ]
  ]

  try {
    stage("Checkout source"){
      echo "Checkout source..."
      checkout scm
    }

    stage("Build image and push to ECR") {
      echo "Build and push image to ECR..."
      sh(returnStdout: true, script: "set +x; \$(aws ecr get-login --no-include-email --region '${awsRegion}' --registry-ids '${awsAccountID}'); set -x")
      apps.each { item ->
        echo "Building and pushing ${item.key}"
        dir(apps["${item.key}"]["dockerfileDir"]){
          docker.withRegistry("https://${ecrRegistry}") {
            dockerImage = docker.build("${ecrRegistry}/${apps["${item.key}"]["ecrRepoName"]}:${apps["${item.key}"]["ecrImageTag"]}", "-f Dockerfile .")
            dockerImage.push()
          } // docker.withRegistry
        } // dir
      } // apps.each
    } // stage

    stage("Deploy to ECS"){
      echo "Deploying to ECS..."
      // Assumes a service and task definition has already been created in the InsecureInc cluster.
      // Therefore only need to update the service using --force-new-deployment option to use latest image with same name
      // If your updated Docker image uses the same tag as what is in the existing task definition for your service 
      // (for example, my_image:latest ), you do not need to create a new revision of your task definition. You can update 
      // the service using the force-new-deployment option. The new tasks launched by the deployment pull the current image/tag 
      // combination from your repository when they start.
      apps.each { item ->
        apps["${item.key}"]["ecsServiceNames"].each { service ->
          sh(returnStdout: true, script: "aws ecs --region ${awsRegion} update-service --cluster ${ecsCluster} --service ${service} --force-new-deployment")
          echo "Deployed ${service}"
        } // service.each
      } // apps.each
    } // stage
  } // try
  finally {
    deleteDir()
  } // finally
} // node