## Get Leaderboard

The last function that we will develop is the `GetLeaderboardFunction` that will return the scores for all players.


### Infrastructure

The only thing to add is a `GetLeaderboardFunction`, add a policy document that allows the function to `Query` and `Scan` (depending on Lambda implementation) the `ScoreTable` and map the Lambda execution to an event triggered by a `GET` request to the `/api/leaderboard` API Gateway resource:

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
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});

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

A reference implementation of the Lambda is available on [GitHub](https://github.com/jayway/going-serverless-workshop/blob/master/lambdas/get-leaderboard/index.js)


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
