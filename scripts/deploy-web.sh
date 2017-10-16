#!/usr/bin/env bash

set -e

script=$(basename $0)
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( cd "$scriptDir/.." && pwd )"
clientDir="$rootDir/rps-client"
clientEnvDir="$clientDir/src/environments"
region="eu-west-1"
stackName=
apiStackName=

usage="usage: $script [-s|--stack-name -r|--region -a | --api-stack-name -h|--help]
    -h| --help              this help
    -r| --region            AWS region (defaults to '$region')
    -s| --stack-name        web stack name
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
        -s|--stack-name)
        stackName="$2"
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

if [[ -z $stackName ]]; then
    echo "You must specify stack name using -s or --stack-name"
    exit 1
fi

if [[ -z $apiStackName ]]; then
    echo "You must specify the API stack name using -a or --api-stack-name"
    exit 1
fi


# Get the API id from the API stack
apiId=(`aws cloudformation describe-stack-resources --stack-name $apiStackName \
    --query "StackResources[?ResourceType == 'AWS::ApiGateway::RestApi'].PhysicalResourceId" \
    --region $region \
    --output text`)
apiGatewayOriginDomain="$apiId.execute-api.$region.amazonaws.com"

aws cloudformation deploy \
    --stack-name $stackName \
    --template-file web.cfn.yaml \
    --parameter-overrides APIGatewayOriginDomain=$apiGatewayOriginDomain \
    --region $region
