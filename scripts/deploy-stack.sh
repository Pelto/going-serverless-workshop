#!/usr/bin/env bash

set -e


script=$(basename $0)
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( cd "$scriptDir/.." && pwd )"
region="eu-west-1"
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

aws cloudformation deploy \
    --template-file ${rootDir}/cloudformation.sam.output.yaml \
    --region ${region} \
    --stack-name ${stackName} \
    --capabilities CAPABILITY_NAMED_IAM

apiId=(`aws cloudformation describe-stack-resources --stack-name $stackName \
    --query "StackResources[?ResourceType == 'AWS::ApiGateway::RestApi'].PhysicalResourceId" \
    --region $region \
    --output text`)

apiUrl="https://$apiId.execute-api.$region.amazonaws.com/Prod"

echo "Deployed API to $apiUrl"
