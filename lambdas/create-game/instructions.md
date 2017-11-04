# Create Game

## Infrastructure

The first thing that we need to create is a database for our games. For storing the games we will use [AWS DynamoDB](https://aws.amazon.com/dynamodb). We start with adding the table in `api.sam.yaml`.

```
  GameTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
        - AttributeName: gameId
          AttributeType: S
      KeySchema:
        - AttributeName: gameId
          KeyType: HASH
      ProvisionedThroughput:
        ReadCapacityUnits: 1
        WriteCapacityUnits: 1
```

Once we have our table we can start with defining the Lambda function that will create our games. We will call name it `CreateGameFunction`.

```
  CreateGameFunction:
    Type: AWS::Serverless::Function
    Properties:
      Description: Creates a game
      Handler: index.handler
      Runtime: nodejs6.10
      CodeUri: lambdas/create-game/
```

This function will be mapped to the code located in `lambdas/create-game/` folder. But since we are writing to our DynamoDB table we need to add two things to the function. First, the function need to know which table to store the game to. So we will add an environment variable:

```
      Environment:
        Variables:
          GAME_TABLE: !Ref GameTable
```

After that we also need to give the function the access rights to `GameTable`. So for this we will attach a policy for the function that grants write access.

```
      Policies:
        - Version: '2012-10-17'
          Statement:
          - Effect: Allow
            Action:
              - dynamodb:PutItem
            Resource: !GetAtt GameTable.Arn
```

Once we have our DynamoDB setup we also need to add an API Gateway that can handle our incoming HTTP requests. For this we will add the following event:

```
      Events:
        CreateGame:
          Type: Api
          Properties:
            Method: post
            Path: /api/games
```

When you have gotten this far you should have the following resources in your template:

```
  CreateGameFunction:
    Type: AWS::Serverless::Function
    Properties:
      Description: Creates a game
      Handler: index.handler
      Runtime: nodejs6.10
      CodeUri: lambdas/create-game/
      Environment:
        Variables:
          GAME_TABLE: !Ref GameTable
      Policies:
        - Version: '2012-10-17'
          Statement:
          - Effect: Allow
            Action:
              - dynamodb:PutItem
            Resource: !GetAtt GameTable.Arn
      Events:
        CreateGame:
          Type: Api
          Properties:
            Method: post
            Path: /api/games

  GameTable:
    Type: AWS::DynamoDB::Table
    Properties:
      AttributeDefinitions:
        - AttributeName: gameId
          AttributeType: S
      KeySchema:
        - AttributeName: gameId
          KeyType: HASH
      ProvisionedThroughput:
        ReadCapacityUnits: 1
        WriteCapacityUnits: 1
```

Now we can move on to the code

## Implementation

The `lambdas/create-game/index.js` will contain your lambda function. You might recal that you specified the `Handler` property to `index.handler`. That means that when your lambda starts it will try to do a `require` on `index` and then call the exported method `handler`. So let's start with creating the handler.

```
'use strict';

exports.handler = function(event, context, callback) {

}
```

We want to store our games in DynamoDB, so let's start with importing the `aws-sdk` and create our `AWS.DynamoDB.DocumentClient`:

```
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});
```

Let's start with creating a function that stores the game to the `GameTable`. In your lambda function you specified a environment variable `GAME_TABLE` that contains the name of the table. 

When we store our games we want to make sure that we don't override a game that is already created. With this in mind our save game function might look something like:

```
function saveGame(gameId) {
    const params = {
        TableName : process.env.GAME_TABLE,
        Item: {
            gameId: gameId,
            state: 'CREATED'
        },
        ConditionExpression: 'attribute_not_exists(gameId)',
    };
    return documentClient
        .put(params)
        .promise()
        .then(() => params.Item);
}
```

When we call our `saveGame` function we need know the id of the game. The id will be present in the request body of the event. The request body will be presented as a string, so don't forget to use `JSON.parse` before accessing it. With this in mind, let's write a small function for it:

```
function getGameId(event) {
    return JSON.parse(event.body).gameId;
}
```

Now most of the things in place, so let's  startcombine it all in our `handler` function:

```
exports.handler = function(event, context, callback) {

    const gameId = getGameId(event);

    return saveGame(gameId)
        .then(() => {
            // Return the response to the client
        })
        .catch(err => {
            // Return an error to the client
        });
};
```

The response will always follow the same structure, an object with `statusCode` and a string in `body` for our JSON.

When we have created our game we want to send back the game together with with a `HTTP 200`. We will settle for a easy error handling that for any error just returns `HTTP 500` with a JSON object that contains the error messsage. So we can create the two following functions for each case:

```
function successfulResponse(callback) {
    return () => {
        callback(null, {
            statusCode: 200
        });
    }
}

function failedResponse(callback) {
    return err => {
        console.error(err);
        return callback(null, {
            statusCode: 500,
            body: JSON.stringify({
                message: err.message
            })
        })
    }
}
```

Now we can extend our promise chain with these functions:

```
exports.handler = function(event, context, callback) {

    const gameId = getGameId(event);

    return saveGame(gameId)
        .then(successfulResponse(callback))
        .catch(failedResponse(callback));
};
```

You can view the finished lambda function at the [Github repository](https://github.com/jayway/going-serverless-workshop/blob/solution/lambdas/create-game/index.js).

## Bonus chapter


