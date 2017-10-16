# Going Serverless - workshop
A workshop on how to construct serverless applications on AWS.


## Getting started

It is possible to execute the application on localhost by executing the script located at

```
./scripts/run-localhost.sh --stack-name <stack-name>
```


### 1. Deploy the backend

```
./scripts/deploy-api.sh --stack-name <api-stack-name> --bucket <bucket-name>
```

Take note of the URL that the script returns. This will be needed in next step.


### 2. Deploy the web client

Deploy the stack by `scripts/deploy-client.sh --stack-name <api-stack-name>`


# Instructions

## Deploy and test the initial stack

To get started with the workshop the first thing that we'll do is to deploy the application. To deploy a SAM template there are two necessary steps. The stack has to be packaged, i.e. we will upload the code to an Amazon S3 bucket. This will be done with the AWS command `aws cloudformation package`. Once the stack has been packaged you will notice a new file named  `api.sam.output.yaml`. That is the file that we will later deploy. This will done with the AWS command `aws cloudformation deploy`.

To simplify the above process we have combined those two commands into one script:

```
./scripts/deploy-api.sh --stack-name <api-stack-name> --bucket <bucket-name>
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
./scripts/test-stack.sh --stack-name <api-stack-name>
```

For more reference on how to test the stack you could have a look at [API documentation](docs/rest-api.md).

## Implement the get game function

To implement the get-game function there are two things that we have to do:

1. Add the function to `api.sam.yaml`
2. Implement the function

### Infrastructure

Let's start with adding a new function. Start with adding the following to the template:

```
  GetGameFunction:
    Type: AWS::Serverless::Function
      Properties:
        Description: Gets game status
        Handler: index.handler
        Runtime: nodejs6.10
        CodeUri: lambdas/get-game/
```

This will give you a basic lambda function in your template. However, as of now we don't have a way of interacting with this function. The first thing that we want to do is to connect it to our API. We do this by connecting an event to it and adding it under our Amazon API Gateway. To add a HTTP mapping to the `GetGameFunction` add the following to it's properties:

```
  Events:
    GetGame:
      Type: Api
      Properties:
        Method: get
        Path: /games/{gameId}
```

When we implement the function we will also need a reference to our DynamoDB table named `GameTable`. We need to add two new properties to our lambda function for this. We need to inject the name as a process environment under `Environment` and give the Lambda's IAM role read access by adding a policy under `Policies`. For the environment variables, add the following:

```
  Environment:
    Variables:
      GAME_TABLE: !Ref GameTable
```

This will inject the name of the table as an environment variable and accessible from node in `process.env.GAME_TABLE`. For the policy add the following statement:

```
  Policies:
    - Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Action:
            - dynamodb:GetItem
          Resource: !GetAtt GameTable.Arn
```

By default our lambda does not have any rights at all besides what is defined in the managed IAM policy `AWSLambdaBasicExecution`. So if we want the lambda to access other IAM resources we have to add the proper policies to it. 


Your function should be defined now, if you have followed the steps it should look something like:

```
GetGameFunction:
  Type: AWS::Serverless::Function
  Properties:
    Description: Gets game status
    Handler: index.handler
    Runtime: nodejs6.10
    CodeUri: lambdas/get-game/
    Environment:
      Variables:
        GAME_TABLE: !Ref GameTable
    Policies:
      - Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Action:
              - dynamodb:GetItem
            Resource: !GetAtt GameTable.Arn
    Events:
    GetGame:
      Type: Api
      Properties:
        Method: get
        Path: /games/{gameId}
```


### Implementation

Open the file `lambdas/get-game/index.js`. In it you will find an empty handler function. This lambda is the simplest one in this workshop as it is only querying the DynamoDB table `GameTable` for one record and returning it. The first thing that we want to do is to initialize our DynamoDB client. For this we will use the AWS SDK. The AWS SDK is always available in the lambda environment. We want to create a [DynamoDB document client](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html). To do this we will add the following code to our lambda:

```
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});
```

As we specified the path `/games/{gameId}` we have the `gameId` as a path parameter available in the event. The event is specified in the [API Gateway proxy integration input](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format). Consequently, we can extract the `gameId` from the path parameters, e.g.

```
function extractGameId(event) {
    return event.pathParameters.gameId;
}
```

Now we can use the DynamoDB document client to get the record. To do this we will use the [get(params)](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#get-property) method in the document client. In the parameters we will specify the name of the table and the value of the hash key that we want to get. The name of the table is the tablename that we injected in our environment variables. The hash key is the `gameId`. 

```
function getGame(gameId) {
    
    const params = {
        TableName: process.env.GAME_TABLE,
        Key: {
            gameId: gameId
        }
    };
    
    return documentClient
        .get(params)
        .promise()
}
```

Now we have a promise with the result. The result has a key named `Item` that will contain the value from DynamoDB. If no record was found the `Item` will be `undefined`. The next step is to convert the result to a HTTP response. If we have an item we want to create a valid 200 response with the game, if no game was found we want to return a simple 404 response.

To return a response we will use the `callback` in the handler. The callback expects an object matching the [API Gateway proxy integration output format](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-output-format).

* `statusCode` that contains a `number`
* `body` that contains a string of the JSON that we want to send

Based on this we can add the following step to our promise:

```
return getGame(gameId)
    .then(data => {
        let response = {};
    
        if (data.Item) {
            response.statusCode = 200;
            response.body = JSON.stringify(data.Item);
        } else {
            response.statusCode = 404;
            response.body = "";
        }
    
        return callback(null, response);
    })
```

As a last step we also want to handle any errors from DynamoDB. So we create a simple error handler. Errors that we want to present must be sent as a return value to the `callback`. Typically we want to avoid giving the raw server errors to our clients, but to make the this a bit more testable we are composing the error into a readable message:

```
    .catch(err => {
        console.error(err);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify({
                message: err.message
            })
        });
    })
```

Now you should have a fully implemented lambda. A finished version of the lambda is available on [GitHub](https://github.com/jayway/going-serverless-workshop/blob/master/lambdas/get-game/index.js)
