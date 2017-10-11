# going-serverless-workshop
A workshop on how to construct serverless applications on AWS


## Deploy everything

### 1. Package the backend

```
./scripts/package-stack.sh 
```

This will upload all of the lambda packages to S3 and generate an output file.


### 2. Deploy the backend

```
./scripts/deploy-stack --stack-name <stack-name>
```

Take note of the URL that the script returns. This will be needed in next step.

### 3. Configure the client to use the stack

Modify the file `rps-client/src/environments/environments.prod.ts` so that setting `apiUrl` points to the backend. (The full API Gateway URL including the basepath `/prod` is required).


### 4. Deploy the web app

Deploy the stack by `scripts/deploy-web.sh --stack-name <stack-name>`


## REST API

### Constants

| Moves         |
|---------------|
| `ROCK`        |
| `PAPER`       |
| `SCISSORS`    |


| State         | Description                                       |
|---------------|-------------------------------------------------- |
| `CREATED`     | Game has been created, no moves yet               |
| `FIRST_MOVE`  | The first player has made a move                  |
| `WINNER`      | Both players have played, there is a winner       |
| `DRAW`        | Both players have played and made the same move   |

### Create Game

Creates a new Rock Paper Scissors game. 

Request
```
POST [server]/games
{
  "gameId": "42"
}
```
Response
```
HTTP/1.1 201 Created
Location: [server]/games/42
```


### Get Game


Request
```
GET [server]/games/42
```
Response
```
HTTP/1.1 200 OK
{
    "players": [
        {
            "playerId": "abc"
            "move": "ROCK",
        },
        {
            "playerId": "xyz"
            "move": "PAPER",
        }
    ],
    "state": "WINNER",
    "winner": "xyz",
    "expirationTime": 1506195639
}
```


### Make Move

Request
```
POST [server]/move
{
    "gameId": "13",
    "playerId": "pqr",
    "move": "ROCK"
}
```
Response
```
HTTP/1.1 200 OK
{
    "players": [
        {
            "playerId": "pqr"
            "move": "ROCK",
        }
    ],
    "gameId": "3",
    "state": "FIRST_MOVE"
    "expirationTime": 1506197262,
}
```


### Get Leaderboard

Request
```
GET [server]/leaderboard
```
Response
```
HTTP/1.1 200 OK
[
    {
        "playerId": "abc"
        "score": 10,
    },
    {
        "playerId": "qpr"
        "score": 5,
    },
    {
        "playerId": "xyz"
        "score": 1,
    }
]
```


## DynamoDB Tables

### GameTable

#### Properties

| Property  | Type              | Description                               |
|-----------|------------------ | ----------------------------------------- |
| gameId    | S (String)        | The id of a game                          |
| players   | L (List)          | The participating players and their moves |
| state     | S (String)        | The current state of the game             |
| winner    | S (String)        | The id of the winning player (if any)     |



#### Primary Key 

| Index     | Type      |
| --------- | --------- |
| gameId    | partition |

Example:

| gameId    | players                                                                   | state         | winner    |
|-----------|-------------------------------------------------------------------------- | ------------- | --------- |
| 13        |                                                                           | "CREATED"     |           |
| 27        | [{playerId: "abc", move: "PAPER"}]                                        | "FIRST_MOVE"  |           |
| 42        | [{playerId: "mno", move: "ROCK"}, {playerId: "pqr", move: "SCISSORS"}]    | "WINNER"      | "mno"     |
| 63        | [{playerId: "abc", move: "ROCK"}, {playerId: "pqr", move: "ROCK"}]        | "DRAW"        |           |


### ScoreTable

| Property  | Type  | Description                   |
|-----------|-------|------------------------------ |
| playerId  | S     | The id of the player          |
| score     | N     | The accumulated player score  |
| gameTitle | S     | The title of the game         |


#### Primary Key

| Index     | Type      |
| --------- | --------- |
| playerId  | partition |


#### Global Secondary Index

GSI name: `scoreIndex`

| Index     | Type              |
| --------- | ----------------- | 
| gameTitle | partition (hash)  |
| score     | sort (range)      |

Example:

| playerId  | score     | gameTitle             |
|-----------|---------- | --------------------- |
| "abc"     | 12        | "Rock Paper Scissors" |
| "mno"     | 33        | "Rock Paper Scissors" |