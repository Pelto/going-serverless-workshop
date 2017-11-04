# REST API


## Create Game

Creates a new Rock Paper Scissors game. 

Request
```
POST [server]/api/games
{
  "gameId": "42"
}
```
Response
```
HTTP/1.1 200 OK
```

Curl command:

```
curl --data '{"gameId": "42"}' [server]/api/games
```
```
HTTP/1.1 200 OK
{
    "gameId": "42",
    "state": "CREATED",
}
```


## Get Game

Gets the current state of a specific game.

Request
```
GET [server]/api/games/{gameId}
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
    "gameId": "42",
    "state": "WINNER",
    "winner": "xyz",
    "expirationTime": 1506195639
}
```

Curl command:

```
curl [server]/api/games/{gameId}
```


## Make Move

A player makes a move in an existing game.

Request
```
POST [server]/api/moves
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

Curl command:

```
curl --data '{"gameId": "42", "playerId": "Rocky", "move": "ROCK" }' [server]/api/moves
```

## Get Leaderboard

Returns the leaderboard based on the score of all games.

Request
```
GET [server]/api/leaderboard
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

Curl command:

```
curl [server]/api/leaderboard
```

## Full example

```
curl -f -i --data '{"gameId":"42"}' https://yz19149qcd.execute-api.eu-west-1.amazonaws.com/Prod/api/games
curl -f -i https://yz19149qcd.execute-api.eu-west-1.amazonaws.com/Prod/api/games/42
curl -f -i --data '{"gameId":"42","playerId":"rocky","move":"ROCK"}' https://yz19149qcd.execute-api.eu-west-1.amazonaws.com/Prod/api/moves
curl -f -i --data '{"gameId":"42","playerId":"freddy","move":"SCISSORS"}' https://yz19149qcd.execute-api.eu-west-1.amazonaws.com/Prod/api/moves
curl -f -i https://yz19149qcd.execute-api.eu-west-1.amazonaws.com/Prod/api/leaderboard
```


## Constants

| Moves         |
|---------------|
| `ROCK`        |
| `PAPER`       |
| `SCISSORS`    |


| Game State    | Description                                       |
|---------------|-------------------------------------------------- |
| `CREATED`     | Game has been created, no moves yet               |
| `FIRST_MOVE`  | The first player has made a move                  |
| `WINNER`      | Both players have played, there is a winner       |
| `DRAW`        | Both players have played and made the same move   |
