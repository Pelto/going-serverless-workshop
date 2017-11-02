## Get Game

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

This will give you a basic lambda function in your template. However, as of now we don't have a way of interacting with this function. The first thing that we want to do is to connect it to our API. We do this by connecting an event to it and adding it under our Amazon API Gateway as a `GET` request for the `/api/games/{gameId}` endpoint. To add a HTTP mapping to the `GetGameFunction` add the following to it's properties:

```
  Events:
    GetGame:
      Type: Api
      Properties:
        Method: get
        Path: /api/games/{gameId}
```

When we implement the function we will also need a reference to our DynamoDB table named `GameTable`. We need to add two new properties to our lambda function for this. We need to inject the name as a process environment under `Environment` and give the Lambda's IAM role read access by adding a policy under `Policies`. For the environment variables, add the following:

```
  Environment:
    Variables:
      GAME_TABLE: !Ref GameTable
```

This will inject the name of the table as an environment variable and accessible from node in `process.env.GAME_TABLE`. However, this only give us the name of the table. We also need to give the lambda function read access for it. To give it access, we will add the following under `Properties` in the `GetGameFunction`:

```
  Policies:
    - Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Action: 'dynamodb:GetItem'
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
            Action: 'dynamodb:GetItem'
            Resource: !GetAtt GameTable.Arn
    Events:
      GetGame:
        Type: Api
        Properties:
          Method: get
          Path: /api/games/{gameId}
```


### Lambda Implementation

Open the file `lambdas/get-game/index.js`. In it you will find an empty handler function. This lambda is the simplest one in this workshop as it is only querying the DynamoDB table `GameTable` for one record and returning it. The first thing that we want to do is to initialize our DynamoDB client. For this we will use the AWS SDK. The AWS SDK is always available in the lambda environment. We want to create a [DynamoDB document client](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html). To do this we will add the following code to our lambda:

```
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});
```

As we specified the path `/api/games/{gameId}` we have the `gameId` as a path parameter available in the event. The event is specified in the [API Gateway proxy integration input](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format). Consequently, we can extract the `gameId` from the path parameters, e.g.

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
        .then(data => data.Item)
}
```

Now we have a promise with the result. The result has a key named `Item` that will contain the value from DynamoDB. If no record was found the `Item` will be `undefined`. The next step is to convert the result to a HTTP response. If we have an item we want to create a valid 200 response with the game, if no game was found we want to return a simple 404 response.

To return a response we will use the `callback` in the handler. The callback expects an object matching the [API Gateway proxy integration output format](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-output-format).

* `statusCode` that contains a `number`
* `body` that contains a string of the JSON that we want to send

Based on this we can create the following function that maps a game to a response:

```
function toResponse(data) {
    let response = {};

    if (data) {
        response.statusCode = 200;
        response.body = JSON.stringify(data);
    } else {
        response.statusCode = 404;
        response.body = "";
    }

    return response;
}
```

As a last step we also want to handle any errors from DynamoDB. So we create a simple error handler. Errors that we want to present must be sent as a return value to the `callback`. Typically we want to avoid giving the raw server errors to our clients, but to make the this a bit more testable we are composing the error into a readable message:

```
function returnError(callback) {
    return function(err) {
        console.error(err);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({
                message: err.message
            })
        });
    };
}
```

Now we can combine these functions in our handler to the following:

```
exports.handler = function(event, context, callback) {
    const gameId = extractGameId(event);
    return getGame(gameId)
        .then(toResponse)
        .then(response => callback(null, response))
        .catch(returnError(callback));
}

Now you should have a fully implemented lambda. A finished version of the lambda is available on [GitHub](https://github.com/jayway/going-serverless-workshop/blob/master/lambdas/get-game/index.js)



## Bonus Task

DynamoDB has support for [TTL - Time To Live](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/howitworks-ttl.html), i.e. automatic removal of items that have expired on a best effort basis (typically within 48h). For large tables with lots of data introducing TTL can significantly reduce your operational cost, since one part of the pricing model derives from the amout of indexed storage.


### Infrastructure

Start by introducing a [TimeToLiveSpecification](http://docs.aws.amazon.com/sdkforruby/api/Aws/DynamoDB/Types/TimeToLiveSpecification.html) to the `GameTable` 
```
      TimeToLiveSpecification:
        AttributeName: expirationTime
        Enabled: true
```

### Application Modification

Make sure that each item in the `GameTable` also gets an `expirationTime` attribute. The value of the attribute should []according to the documentation](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/howitworks-ttl.html) be:

> If the epoch time value stored in the attribute is less than the current time, the item is marked as expired and subsequently deleted.

> **NOTE** 
> The epoch time format is the number of seconds elapsed since 12:00:00 AM January 1st, 1970 UTC. 

So if you would like a game to be deleted after one day, you can calculate the epoch as:

```
function generateExpirationTime() {
   const date = new Date();
   // add one day
   date.setDate(date.getDate() + 1);
   const epochMilliSeconds = date.getTime();
   const epochSeconds = epochMilliSeconds / 1000;
   return Math.floor(epochSeconds);
}
```

Last step is to actually persist the value in the DynamoDB table. In this example, I choose to do it as part of the game creation process in the `CreateGameFunction`:

```
function saveGame(gameId) {
    const expirationTime = generateExpirationTime();
    const params = {
        TableName : process.env.GAME_TABLE,
        Item: {
            gameId: gameId,
            state: 'CREATED',
            expirationTime: expirationTime
        },
        ConditionExpression: 'attribute_not_exists(gameId)',
    };
    return documentClient
        .put(params)
        .promise();
}
```
