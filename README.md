# going-serverless-workshop
A workshop on how to construct serverless applications on AWS


# DynamoDB Tables

## GamesTable

| Property  | Type              | Description                               |
|-----------|------------------ |------------------------------------------ |
| GameId    | N (Number)        | The id of a game                          |
| Players   | L (List)          | The participating players and their moves |
| State     | M (Map)           | The current state of the game             |


Example:

| GameId    | Players                                                                   | State                             |
|-----------|-------------------------------------------------------------------------- | --------------------------------- |
| 13        |                                                                           | {state: "CREATED"}                |
| 27        | [{playerId: "abc", move: "PAPER"}]                                        | {state: "IN_PROGRESS"}            |
| 42        | [{playerId: "mno", move: "ROCK"}, {playerId: "pqr", move: "SCISSORS"}]    | {state: "WINNER", winner: "mno"}  |
| 63        | [{playerId: "abc", move: "ROCK"}, {playerId: "pqr", move: "ROCK"}]        | {state: "DRAW"}                   |


## ScoreTable

| Property  | Type  | Description                   |
|-----------|-------|------------------------------ |
| PlayerId  | S     | A player id                   |
| Score     | N     | The accumulated player score  |


Example:

| PlayerId  | Score     |
|-----------|---------- |
| "abc"     | 12        |
| "mno"     | 33        |