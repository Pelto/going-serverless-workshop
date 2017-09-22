# going-serverless-workshop
A workshop on how to construct serverless applications on AWS


# DynamoDB Tables

## GamesTable

| Property  | Type              | Description                               |
|-----------|------------------ |------------------------------------------ |
| GameId    | S (String)        | The id of a game                          |
| Players   | L (List)          | The participating players and their moves |
| State     | S (String)        | The current state of the game             |
| Winner    | S (String)        | The id of the winning player (if any)     |


Example:

| GameId    | Players                                                                   | State         | Winner    |
|-----------|-------------------------------------------------------------------------- | ------------- | --------- |
| 13        |                                                                           | "CREATED"     |           |
| 27        | [{playerId: "abc", move: "PAPER"}]                                        | "FIRST_MOVE"  |           |
| 42        | [{playerId: "mno", move: "ROCK"}, {playerId: "pqr", move: "SCISSORS"}]    | "WINNER"      | "mno"     |
| 63        | [{playerId: "abc", move: "ROCK"}, {playerId: "pqr", move: "ROCK"}]        | "DRAW"        |           |


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