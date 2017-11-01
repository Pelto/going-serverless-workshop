## Make Move

Making a move is the most complex Lambda function in terms of application logic, but apart from that it is not very different from the other. 

### Infrastructure 

A new `MakeMoveFunction` needs to be added to the existing infrastructure in the `api.sam.yml` file.

First some basic data to declare function name, handler function, runtime and `CodeUri`:
```
  MakeMoveFunction:
    Type: AWS::Serverless::Function
    Properties:
      Description: Makes a move
      Handler: index.handler
      Runtime: nodejs6.10
      CodeUri: lambdas/make-move/
```
Then we pass the name of the `GameTable` as an environment variable so that we can access it when we call from the Lambda application code:
```
      Environment:
        Variables:
          GAME_TABLE: !Ref GameTable
```
Passing the DynamoDB name is not enough, we must also create a policy that allows the Lambda to `GetItem` as well as `PutItem` to the
table:
```          
      Policies:
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - dynamodb:GetItem
                - dynamodb:PutItem
              Resource: !GetAtt GameTable.Arn
```
Finally, we also map `POST` request to the API Gateway `/api/moves` endpoint as triggers of hte Lambda function handler:
```
      Events:
        MakeMove:
          Type: Api
          Properties:
            Method: post
            Path: /api/moves
```
 


### Lambda Implementation

The request payload is sent in the request body, e.g.

```
{
    "gameId": "13",
    "playerId": "pqr",
    "move": "ROCK"
}
```

The first thing that we want to do is to import the AWS sdk for working with DynamoDB.

```
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    region: process.env.AWS_REGION
});
```


The request body is forwarded to the Lambda function through the [API Gateway Proxy integration](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format), to be more precise it is available as a JSON string in the `event.body` attribute.

```
function parseEvent(event) {
    const requestBody = JSON.parse(event.body);
    return {
        gameId: requestBody.gameId,
        playerId: requestBody.playerId,
        move: requestBody.move
    }
}
``` 

Based on the `gameId` in the parsed body, we can fetch the game from the `GameTable`: 

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
        .then(data => data.Item);
}
```

The actual business logic of a Rock Paper Scissors game is not that relevant, it just happens to be the domain that we chose:

```
function updateGame(game, playerId, move) {

    const WINNING_COMBINATIONS = {
        ROCK: 'SCISSORS',
        PAPER: 'ROCK',
        SCISSORS: 'PAPER'
    };

    function addPlayer(game, playerId, move) {
        if (!game.players) {
            game.players = [];
        }
        const player = { playerId, move };
        game.players.push(player);
        return game;
    }

    function updateState(game) {

        if (game.state === 'CREATED') {
            game.state = 'FIRST_MOVE';
            return game;
        }

        const playerA = game.players[0];
        const playerB = game.players[1];

        if (playerA.move === playerB.move) {
            game.state = 'DRAW';
            return game;
        }

        game.state = 'WINNER';
        game.winner = WINNING_COMBINATIONS[playerA.move] === playerB.move
            ? playerA.playerId
            : playerB.playerId;

        return game;
    }

    addPlayer(game, playerId, move);
    updateState(game);

    return game;
}
``` 

After the game has been updated with the `playerId`, the `move` and its new `state`, the game needs to put back in the `GameTable` again. A part of this implementation of Rock Paper Scissor is that a player is only allowed to make a move if the game is in state `CREATED` or `FIRST_MOVE` (since the tow other valid states `DRAW` and `WINNER` indicates that the game has already been completed). DynamoDB uses something called [ConditionExpression](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html#Expressions.ConditionExpressions.SimpleComparisons) (there is also a list of [Comaprison Operators](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.OperatorsAndFunctions.html)). 

```
function saveGame(game) {
    const params = {
        TableName: process.env.GAME_TABLE,
        Item: game,
        ConditionExpression: '#state IN (:created, :firstMove)',
        ExpressionAttributeNames: {
            '#state': 'state'
        },
        ExpressionAttributeValues: {
            ':created': 'CREATED',
            ':firstMove': 'FIRST_MOVE'
        }
    };
    return documentClient
        .put(params)
        .promise()
        .then(() => game);
}
``` 

We add a utility function to add to create a valid [API Gateway proxy response](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-output-format):

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

Finally, we combine all functions in the Lambda function handler:

```
exports.handler = function (event, context, callback) {

    const request = parseEvent(event);

    return getGame(request.gameId)
        .then(game => updateGame(game, request.playerId, request.move))
        .then(saveGame)
        .then(game => {
            const resp = createResponse(200, game);
            callback(null, resp);
        })
        .catch(err => {
            console.error(err);
            const resp = createResponse(500, {message: err.message});
            callback(null, resp);
        });
};
```

See [GitHub](https://github.com/jayway/going-serverless-workshop/blob/master/lambdas/make-move/index.js) for a reference implementation.
