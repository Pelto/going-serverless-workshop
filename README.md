# going-serverless-workshop
A workshop on how to construct serverless applications on AWS


## REST API

### Constants

| Moves         |
|---------------|
| `ROCK`         |
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

| Property  | Type              | Description                               |
|-----------|------------------ | ----------------------------------------- |
| gameId    | S (String)        | The id of a game                          |
| players   | L (List)          | The participating players and their moves |
| state     | S (String)        | The current state of the game             |
| winner    | S (String)        | The id of the winning player (if any)     |


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


Example:

| playerId  | score     |
|-----------|---------- |
| "abc"     | 12        |
| "mno"     | 33        |