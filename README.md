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

To get a jumpstart on a later chapter we will also deploy the web now. Since we want to avoid messing with CORS in this lab we will put both the web and the API behind a cloudfront distribution. A cloudfront distribution can take anywhere between 10 to 30 minutes to provision, so we might as well do it now.

```
./scripts/deploy-web.sh \
  --api-stack-name <api-stack-name> \
  --stack-name <web-stack-name>
```

This script will provosion a cloudfront distribution, set up one origin with pathmapping `/api/*` towards our API gateway while all other requests will be directed to our S3 bucket where we will upload our Web app.


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

This will give you a basic lambda function in your template. However, as of now we don't have a way of interacting with this function. The first thing that we want to do is to connect it to our API. We do this by connecting an event to it and adding it under our Amazon API Gateway. To add a HTTP mapping to the `GetGameFunction` add the following to it's properties:

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


## Update Score

To implement the update score function there a few things required:

Three changes to the infrastructure in the `api.sam.yaml`:
1. Attach a DynamoDB Stream to the `GameTable` so that we can listen to game events.
2. Create a new DynamoDB `ScoreTable` in which we will update the score for game winners.
3. Create a new `UpdateScoreFunction` function that listen to the events from the DynamoDB Stream from the `GameTable`, checks if there is a winner in the game, and if so adds 10 points to the winner in the `ScoreTable`.

And of course, we need to write the implementation of the `UpdateScore` function.


### Infrastructure

Start by locating the `GameTable`. It's configuration needs to be updated so that there is a stream to which table changes are published. Add the following [StreamSpecification](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-dynamodb-table.html#cfn-dynamodb-table-streamspecification)
```
StreamSpecification:
    StreamViewType: NEW_AND_OLD_IMAGES
```

We also need somewhere to store the score for the players. Create a new DynamoDB table called `ScoreTable` similar to `GameTable`, but this time use `playerId` as hash key:

```
ScoreTable:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions:
      - AttributeName: playerId
        AttributeType: S
    KeySchema:
      - AttributeName: playerId
        KeyType: HASH
    ProvisionedThroughput:
      ReadCapacityUnits: 1
      WriteCapacityUnits: 1
```

Last piece of the infrastructure updates in this part is to create a `UpdateScoreFunction` Lambda. It needs a policy that allows it to update the items in the `ScoreTable` so that the score can be recorded. 

```
UpdateScoreFunction:
  Type: AWS::Serverless::Function
  Properties:
    Description: Updates the score
    Handler: index.handler
    Runtime: nodejs6.10
    CodeUri: lambdas/update-score/
    Policies:
      - Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Action:
              - dynamodb:UpdateItem
            Resource: !GetAtt ScoreTable.Arn
    Environment:
      Variables:
        SCORE_TABLE: !Ref ScoreTable
```

So far, the `UpdateScoreFunction` is similar to the Lambdas we have created previously, but there is one significant difference. All previous functions have been triggered by the a HTTP request through the API Gateway, but this on the other hand will be triggered by the events in a [DynamoDB Event Stream](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#dynamodb), namely the `GameTable` event stream that we just created. 
```
    Events:
      GameEvent:
        Type: DynamoDB
        Properties:
          Stream: !GetAtt GameTable.StreamArn
          StartingPosition: LATEST
```


### Lambda Implementation

The `UpdateScoreFunction` will be triggered whenever there is a change in the `GameTable` table since we are listen to all events from that table. Those events may be when a new game is created, when a player has made a move, a game is finished (either there is a winner or it is a draw) but there is also an event if a game has been deleted from the table. For this reason, we create a small utility functions that filters the events to see whether or not there is a winner. If there is no winner, we can simply ignore the event since there is no need to update the score. Also note that a single event may contain updates of multiple DynamoDB records.

```
function getWinners(event) {
    return event.Records
        .filter(record => {
            return (record.dynamodb.NewImage || {}).winner;
        })
        .map(record => record.dynamodb.NewImage.winner.S);
}
```  

Next, we need to update the `ScoreTable`. We use the [DynamoDB DocumentClient](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html) like before:

```
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});
```

For each winner, we should add 10 points for that player id. [DynamoDB's update function](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#update-property) can be used. Specifically, in the documentation of the `ADD` expression in the [UpdateExpression](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateItem-property) it is stated that:

> `ADD` - Adds the specified value to the item, if the attribute does not already exist. [...] If the existing attribute is a number, and if Value is also a number, then Value is mathematically added to the existing attribute.

```
function addScore(winner) {
    const params = {
        TableName: process.env.SCORE_TABLE,
        Key: {
            playerId: winner,
        },
        UpdateExpression: 'ADD #score :score',
        ExpressionAttributeNames: {
            '#score': 'score'
        },
        ExpressionAttributeValues: {
            ':score': 10
        }
    };
    return documentClient
        .update(params)
        .promise();
}
``` 

The last thing is the glue code between the event handler, the `getWinners()` function and the `addScore()` function. Since the `UpdateScoreFunction` is not triggered by the API Gateway, we do not need return neither a HTTP status code, nor a response body. We simply just execute the `callback` function that was passed in as the function handler argument:

```
exports.handler = function(event, context, callback) {

    const promises = getWinners(event)
        .map(addScore);

    Promise.all(promises)
        .then(res => callback(null, res))
        .catch(err => {
            console.error(err);
            callback(err);
        });
};
```


## Get Leaderboard

The last function that we will develop is the `GetLeaderboardFunction` that will return the scores for all players.


### Infrastructure

The only thing to add is a `GetLeaderboardFunction`, add a policy document that allows the function to `Query` and `Scan` (depending on Lambda implementation) the `ScoreTable` and map the Lambda execution to an event triggered by a request to the `/api/leaderboard` API Gateway resource:

```
GetLeaderboardFunction:
  Type: AWS::Serverless::Function
  Properties:
    Description: Gets leaderboard
    Handler: index.handler
    Runtime: nodejs6.10
    CodeUri: lambdas/get-leaderboard/
    Environment:
      Variables:
        SCORE_TABLE: !Ref ScoreTable
    Policies:
      - Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Action:
              - dynamodb:Query
              - dynamodb:Scan
            Resource: !Sub ${ScoreTable.Arn}
    Events:
      Leaderboard:
        Type: Api
        Properties:
          Method: get
          Path: /api/leaderboard
```

### Lambda Implementation

With the `GetLeaderboardFunction`, there is no request body, query params nor path params to take into consideration. In other words, we can [scan](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property) the `ScoreTable` directly:

```
function getLeaderboard() {
    const params = {
        TableName: process.env.SCORE_TABLE,
    };
    return documentClient
        .scan(params)
        .promise()
        .then(data => data.Items);
}
```

Since we now deal with a API Gateway Lambda proxy integration, we need to create a [proxy response](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-output-format) as we have done previously:

```
function createResponse(httpStatus, responseBody) {
    return {
        statusCode: httpStatus,
        body: responseBody
            ? JSON.stringify(responseBody)
            : ""
    };
}
```  

Lastly, we chain the two functions in the Lambda function handler:
```
exports.handler = function(event, context, callback) {

    return getLeaderboard()
        .then(leaderboard => {
            const resp = createResponse(200, leaderboard);
            callback(null ,resp);
        })
        .catch(err => {
            console.error(err);
            const resp = createResponse(500, {message: err.message});
            callback(null, resp);
        });
};
```


## Bonus Task

Did you notice that the leaderboard was not ordered? It would be better if it was presented in decreasing order based on the player scores. DynamoDB has the notion of sort or range keys that when used together with the [query](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property) function allows you to get the items in order. However, there is a gotcha, and that is that DynamoDB is only able to sort elements that have the same `HASH` key. The entire flow of a high score list is presented in the [Global Secondary Index](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GSI.html) chapter in the DynamoDB reference docs.


### Infrastructure

Currently, the `ScoreTable` uses `gameId` as `partition` key so that will not work. Consequently, we will create a new [GlobalSecondaryIndexes](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-gsi.html) to the `ScoreTable` to enable this functionality. The new GSI will be called `scoreIndex` and it will have a new `HASH` key that will have the same value for all players of the rock paper scissors game. We call this attribute `gameTitle` and it will be of type `S`. We also add the `score` attribute as a `RANGE` (i.e. sort) key to the `scoreIndex`. It should also be noted that we now need to add both the `score` and `gameTitle` attributes to the `AttributeDefinitions` to instruct DynanoDB to of their types. Lastly, sine we also care about which player actually has a score, we need to add the `playerId` to the `Projection` of the `scoreIndex`.

```
ScoreTable:
  Type: AWS::DynamoDB::Table
  Properties:
    AttributeDefinitions:
      - AttributeName: playerId
        AttributeType: S
      - AttributeName: score
        AttributeType: N
      - AttributeName: gameTitle
        AttributeType: S
    KeySchema:
      - AttributeName: playerId
        KeyType: HASH
    ProvisionedThroughput:
      ReadCapacityUnits: 1
      WriteCapacityUnits: 1
    GlobalSecondaryIndexes:
      - IndexName: scoreIndex
        KeySchema:
          - AttributeName: gameTitle
            KeyType: HASH
          - AttributeName: score
            KeyType: RANGE
        Projection:
          ProjectionType: INCLUDE
          NonKeyAttributes:
            - playerId
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
```

Another change we need to do is to change the policy of the `GetLeaderboardFunction` to use the `scoreIndex` instead of the raw `ScoreTable`:

```
Policies:
  - Version: '2012-10-17'
    Statement:
      - Effect: Allow
        Action:
          - dynamodb:Query
          - dynamodb:Scan
        Resource: !Sub ${ScoreTable.Arn}/index/scoreIndex
```

It will take some time for DynamoDB to update the `ScoreTable` to create the new GSI. 


### Lambda Changes

First, we need to update the `UpdateScoreFunction` to also specify `Rock Paper Scissors` as the `gameTitle` to which the score is added to.

```
function addScore(winner) {
    const params = {
        TableName: process.env.SCORE_TABLE,
        Key: {
            playerId: winner,
        },
        UpdateExpression: 'ADD #score :score SET #gameTitle = :gameTitle',
        ExpressionAttributeNames: {
            '#score': 'score',
            '#gameTitle': 'gameTitle'
        },
        ExpressionAttributeValues: {
            ':score': 10,
            ':gameTitle': 'Rock Paper Scissors'
        }
    };
    return documentClient
        .update(params)
        .promise();
}
```

Secondly, we need to update the `GetLeaderboardFunction` to [query](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#query-property) for all the scores belonging to the `gameTitle` `Rock Paper Scissors`. The result is ordered by ascending value of the sort key. Since we would like the scores to be presented in descending order we specify the `ScanIndexForward` to `false`:

```
function getLeaderboard() {
    const params = {
        TableName: process.env.SCORE_TABLE,
        IndexName: 'scoreIndex',
        AttributesToGet: ['playerId', 'score'],
        KeyConditions: {
            gameTitle: {
                ComparisonOperator: "EQ",
                AttributeValueList: ["Rock Paper Scissors"]
            }
        },
        ScanIndexForward: false
    };
    return documentClient
        .query(params)
        .promise()
        .then(data => data.Items);
}
```

Redeploy and check the leaderboard. Is the result not what you expected? It is because all scores that have been added so far did not have the `gameTitle` attribute. Check the `ScoreTable` in DynamoDB using the AWS Console. Try adding the `gameTitle` attribute with the key `Rock Paper Scissors` to all score manually and reload the leaderboard.