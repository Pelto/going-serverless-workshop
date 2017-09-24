#!/usr/bin/env bash

set -e

while [[ $# -gt 1 ]]
do
    key="$1"

    case $key in
        -s|--stack-name)
        STACK_NAME="$2"
        shift
        ;;
        -r|--region)
        REGION="$2"
        shift
        ;;
        *)
        # Unknown
        ;;
    esac
    shift # past argument or value
done

if [[ -z $STACK_NAME ]]; then
    echo "Stack name needs to be specified by either -s or --stack-name"
    exit 1
fi

if [[ -z $REGION ]]; then
    echo "Region needs to be specified be either -r or --region"
    exit 1
fi

aws cloudformation describe-stack-resources --stack-name $STACK_NAME \
    --query "StackResources[?ResourceType == 'AWS::ApiGateway::RestApi'].PhysicalResourceId" \
    --region $REGION \
    --output text \
    | awk '{print "https://"$1".execute-api.eu-west-1.amazonaws.com/Prod"}'
