#!/usr/bin/env bash

set -e

script=$(basename $0)
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( cd "$scriptDir/.." && pwd )"
region="eu-west-1"
samBucket="going-serverless"
stackName=

usage="usage: $script [-h|-r|-s]
    -h| --help          this help
    -r| --region        AWS region (defaults to '$region')
    -s| --stack-name    stack name"

#
# For Bash parsing explanation, please see https://stackoverflow.com/a/14203146
#
while [[ $# -gt 0 ]]
do
    key="$1"

    case $key in
        -h|--help)
        echo "$usage"
        exit 0
        ;;
        -r|--region)
        region="$2"
        shift
        ;;
        -s|--stack-name)
        stackName="$2"
        shift
        ;;
        *)
        # Unknown option
        ;;
    esac
    shift # past argument or value
done

apiId=(`aws cloudformation describe-stack-resources --stack-name $stackName \
    --query "StackResources[?ResourceType == 'AWS::ApiGateway::RestApi'].PhysicalResourceId" \
    --region $region \
    --output text`)

gameTable=(`aws cloudformation describe-stacks --stack-name $stackName \
    --query "Stacks[0].Outputs[?OutputKey == 'GameTable'].OutputValue" \
    --region $region \
    --output text`)

apiUrl="https://$apiId.execute-api.$region.amazonaws.com/Prod"

gameId=(`date +%s`)

createGameCommand="curl -f -i --data '{\"gameId\":\"$gameId\"}' $apiUrl/games"
getGameCommand="curl -f -i $apiUrl/games/$gameId";
makeMoveACommand="curl -f -i --data '{\"gameId\":\"$gameId\",\"playerId\":\"rocky\",\"move\":\"ROCK\"}' $apiUrl/moves"
makeMoveBCommand="curl -f -i --data '{\"gameId\":\"$gameId\",\"playerId\":\"freddy\",\"move\":\"SCISSORS\"}' $apiUrl/moves"
leaderboardCommand="curl -f -i $apiUrl/leaderboard"


echo "#################################################################"
echo "Creating a new game with gameId $gameId"
echo "#################################################################"
echo $createGameCommand
echo ""
eval $createGameCommand
echo ""
echo ""

echo "#################################################################"
echo "Getting the game $gameId"
echo "#################################################################"
echo $getGameCommand
echo ""
eval $getGameCommand
echo ""
echo ""

echo "#################################################################"
echo "Making Rocky's move"
echo "#################################################################"
echo $makeMoveACommand
echo ""
eval $makeMoveACommand
echo ""
echo ""

echo "#################################################################"
echo "Making Freddy's move"
echo "#################################################################"
echo $makeMoveBCommand
echo ""
eval $makeMoveBCommand
echo ""

echo ""
echo "#################################################################"
echo "Checking the leaderboards"
echo "#################################################################"
echo $leaderboardCommand
echo ""
eval $leaderboardCommand
echo ""
echo ""
