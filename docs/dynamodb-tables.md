# DynamoDB Tables

Description of the DynamoDB tables used.


## GameTable

### Properties

| Property  | Type              | Description                               |
|-----------|------------------ | ----------------------------------------- |
| gameId    | S (String)        | The id of a game                          |
| players   | L (List)          | The participating players and their moves |
| state     | S (String)        | The current state of the game             |
| winner    | S (String)        | The id of the winning player (if any)     |


### Primary Key 

| Index     | Type              |
| --------- | ----------------- |
| gameId    | partition (hash)  |

Example:

| gameId    | players                                                                   | state         | winner    |
|-----------|-------------------------------------------------------------------------- | ------------- | --------- |
| 13        |                                                                           | "CREATED"     |           |
| 27        | [{playerId: "abc", move: "PAPER"}]                                        | "FIRST_MOVE"  |           |
| 42        | [{playerId: "mno", move: "ROCK"}, {playerId: "pqr", move: "SCISSORS"}]    | "WINNER"      | "mno"     |
| 63        | [{playerId: "abc", move: "ROCK"}, {playerId: "pqr", move: "ROCK"}]        | "DRAW"        |           |



## ScoreTable

| Property  | Type          | Description                   |
|-----------|---------------|------------------------------ |
| playerId  | S (String)    | The id of the player          |
| score     | N (Number)    | The accumulated player score  |
| gameTitle | S (String)    | The title of the game         |


### Primary Key

| Index     | Type              |
| --------- | ----------------- |
| playerId  | partition (hash)  |


### Global Secondary Index

Global Secondary Index name: `scoreIndex`
Projection: NonKeyAttributes `playerId`

| Property  | Type              |
|-----------|------------------ |
| gameTitle | partition (hash)  |
| score     | sort (range)      |



Example:

| playerId  | score     | gameTitle             |
|-----------|---------- | --------------------- |
| "abc"     | 12        | "Rock Paper Scissors" |
| "mno"     | 33        | "Rock Paper Scissors" |