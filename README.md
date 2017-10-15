# Going Serverless - workshop
A workshop on how to construct serverless applications on AWS. 


## Getting started

It is possible to execute the application on localhost by executing the script located at

```
./scripts/run-localhost.sh --stack-name <your_stack_name>
```


### 1. Deploy the backend

```
./scripts/deploy-stack.sh --stack-name <stack-name>
```

Take note of the URL that the script returns. This will be needed in next step.


### 2. Deploy the web app

Deploy the stack by `scripts/deploy-web.sh --stack-name <stack-name>`

## Instructions

### Deploy and test the initial stack

To get started with the workshop the first thing that we'll do is to deploy the
application. To deploy a SAM template there are two necessary steps. The stack
has to be packaged, i.e. we will upload the code to an Amazon S3 bucket. Once
the stack has been packaged you will notice a new file named 
`cloudformation.sam.output.yaml`. That is the file that we will later deploy.
To simplify the process a script is prepared and can be run by the following
command:

```
./scripts/deploy-stack.sh --stack-name <your_stack>
```

This scripts does everything and will also test your stack and give you the url
to your api. But if you want to do the deployement totally manual you could do
it with just the following two commands:

```
aws cloudformation package \
    --template-file cloudformation.sam.yaml \
    --s3-bucket going-serverless \
    --output-template-file cloudformation.sam.output.yaml

aws cloudformation deploy \
    --stack-name <your-stack> \
    --template-file cloudformation.sam.output.yaml \
    --capabilities CAPABILITY_NAMED_IAM
```

When you deployed the stack you also might noticed the HTTP commands that was
done towards the API and tested the stack. To rerun those commands you could
use the test script:

```
./scripts/test-stack.sh --stack-name <your-stack>
```

For more reference on how to test the stack you could have a look at [API documentation](docs/rest-api.md).

### Implement the get game function
