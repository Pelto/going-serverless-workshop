#!/usr/bin/env bash

set -e


script=$(basename $0)
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( cd "$scriptDir/.." && pwd )"
clientDir="$rootDir/rps-client"
clientEnvDir="$clientDir/src/environments"
region="eu-west-1"

usage="usage: $script [-a|--api-stack-name -r|--region -h|--help]
    -h| --help              this help
    -r| --region            AWS region (defaults to '$region')
    -a| --api-stack-name    API stack name"

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
        -a|--api-stack-name)
        apiStackName="$2"
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

if [[ -z $apiStackName ]]; then
    echo "API stack name must be provided by either --api-stack-name or -a"
    exit 1
fi;

# Get the URL to the backend environment and update the application settings.
apiId=(`aws cloudformation describe-stack-resources --stack-name $apiStackName \
    --query "StackResources[?ResourceType == 'AWS::ApiGateway::RestApi'].PhysicalResourceId" \
    --region $region \
    --output text`)
apiUrl="https://$apiId.execute-api.$region.amazonaws.com/Prod"

mkdir -p "$clientEnvDir"
echo "export const environment = { production: false, apiUrl: '$apiUrl' };" > src/environments/environment.ts

echo "Using backend deployed at $apiUrl"


./node_modules/.bin/ng serve --open
