# Going Serverless - workshop
A workshop on how to implement a serverless application on AWS.


## Getting started

It is possible to execute the application on localhost by executing the script located at

```
./scripts/run-localhost.sh --api-stack-name <api-stack-name>
```


### 1. Deploy the backend

```
./scripts/deploy-api.sh --api-stack-name <api-stack-name> --bucket <bucket-name>
```

Take note of the URL that the script returns. This will be needed in next step.


### 2. Deploy the web client

Deploy the stack by `scripts/deploy-client.sh --api-stack-name <api-stack-name>`


# Instructions

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
    --s3-bucket going-serverless \
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

This script will provision a CloudFront distribution, set up one origin with path mapping `/api/*` towards our API Gateway while all other requests will be directed to our S3 bucket where we will upload our Web app.
