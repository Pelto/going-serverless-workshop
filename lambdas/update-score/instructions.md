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

Last piece of the infrastructure updates in this part is to create a `UpdateScoreFunction` Lambda. 

```
UpdateScoreFunction:
  Type: AWS::Serverless::Function
  Properties:
    Description: Updates the score
    Handler: index.handler
    Runtime: nodejs6.10
    CodeUri: lambdas/update-score/
```

It needs a policy that allows it to update the items in the `ScoreTable` so that the score can be recorded:

```
    Policies:
      - Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Action:
              - dynamodb:UpdateItem
            Resource: !GetAtt ScoreTable.Arn
```

It also needs a refence to the `ScoreTable` so that we can pass the table name to the DynamoDB DocumentClient later when we implement the Lambda function logic. 

```
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

One implementation of the update score Lambda is available on [GitHub](https://github.com/jayway/going-serverless-workshop/blob/master/lambdas/get-leaderboard/index.js)
