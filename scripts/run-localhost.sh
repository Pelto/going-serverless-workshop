#!/usr/bin/env bash

set -e


script=$(basename $0)
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( cd "$scriptDir/.." && pwd )"
clientDir="$rootDir/rps-client"
region="eu-west-1"

usage="usage: $script [-s|--stack-name -r|--region -h|--help]
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


cd "$clientDir"
npm install


if [[ -n $stackName ]]; then
    # Get the URL to the backend environment and update the application settings.
    apiId=(`aws cloudformation describe-stack-resources --stack-name $stackName \
        --query "StackResources[?ResourceType == 'AWS::ApiGateway::RestApi'].PhysicalResourceId" \
        --region $region \
        --output text`)
    apiUrl="https://$apiId.execute-api.$region.amazonaws.com/Prod"
    sed -i -- "s,API_URL,$apiUrl,g" src/environments/environment.ts

    echo "Using backend deployed at $apiUrl"
fi

./node_modules/.bin/ng serve --open
