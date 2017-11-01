# Going Serverless - workshop
A workshop on how to implement a serverless application on AWS.

# Requirements

Make sure that the followig software is installed and configured:

* A posix compatible terminal
* node.js
* [AWS CLI](https://aws.amazon.com/cli/)

# Instructions

## Configuring your Amazon Account

We will work a lot with Cloudformation in this lab, as the templates that you will be deploying will create and update [IAM](http://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) resources you will need to make sure that you have a user that has IAM access rights.

The scripts that we will be using need to be able to use the [AWS CLI](https://aws.amazon.com/cli/), so please make sure you have it installed and configured. If you are running on mac you can install in with homebrew (`brew install awscli`)

Once the [AWS CLI](https://aws.amazon.com/cli/) is installed the next step is to make sure the [AWS CLI](https://aws.amazon.com/cli/) is configured. To configure the CLI have a look at the [AWS documentation](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).

When we have our user the second step is to create an S3 bucket. It will be used to store your Serverless infrastructure and resources as part of the deployment. You can use either the AWS Console or the AWS CLI to create the bucket:

```
./scripts/create-bucket.sh --bucket <bucket-name>
```

## Deploy and test the initial stack

To get started with the workshop the first thing that we'll do is to deploy the application. To deploy a SAM template there are two necessary steps. The stack has to be packaged, i.e. we will upload the code to an Amazon S3 bucket. This will be done with the AWS command `aws cloudformation package`. Once the stack has been packaged you will notice a new file named  `api.sam.output.yaml`. That is the file that we will later deploy. This will done with the AWS command `aws cloudformation deploy`.

To simplify the above process we have combined those two commands into one script:

```
./scripts/deploy-api.sh --api-stack-name <api-stack-name> --bucket <bucket-name>
```

This scripts does everything and will also test your stack and give you the url to your api. But if you want to do the deployment totally manual you could do it with just the following two commands:

```
aws cloudformation package \
    --template-file api.sam.yaml \
    --s3-bucket <bucket-name> \
    --output-template-file api.sam.output.yaml

aws cloudformation deploy \
    --stack-name <your-stack> \
    --template-file api.sam.output.yaml \
    --capabilities CAPABILITY_NAMED_IAM
```

When you deployed the stack you also might noticed the HTTP commands that was done towards the API and tested the stack. You can run the commands without deploying your stack by running:

```
./scripts/test-stack.sh --api-stack-name <api-stack-name>
```

For more reference on how to test the stack you could have a look at [Rock Paper Scissors API documentation](docs/rest-api.md).

To get a jumpstart on a later chapter we will also deploy the web now. Since we want to avoid messing with CORS in this lab we will put both the web and the API behind a cloudfront distribution. A cloudfront distribution can take anywhere between 10 to 30 minutes to provision, so we might as well do it now.

```
./scripts/deploy-web.sh \
  --api-stack-name <api-stack-name> \
  --web-stack-name <web-stack-name>
```

This script will provision a CloudFront distribution, set up one origin with path mapping `/api/*` towards our API Gateway while all other requests will be directed to our S3 bucket where we will upload our Web app. When finished, you can visit the web site if you copy / paste the URL presented in the terminal to a browser. 

```
#################################################################
Deployed CDN to https://[cloud front distribution].cloudfront.net
#################################################################
```

## Get Game

To get started in with the first lambda, head to the instructions at in [lambdas/get-game/instructions.md](lambdas/get-game/instructions.md).

## Make move


## Update Score

To get started with calculating the score we will create a lambda that works on a dynamodb stream from our gametable. To get started, follow the instructions at [lambdas/update-score/instructions.md](lambdas/update-score/instructions.md)

## Leaderboard

Once we have calculated our score we are going to have to build an API for the client. To continue with this, follow the instructions at [lambdas/get-leaderboard/instructions.md](lambdas/update-score/instructions.md)
