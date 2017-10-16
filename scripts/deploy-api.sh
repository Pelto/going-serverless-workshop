#!/usr/bin/env bash

set -e


script=$(basename $0)
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( cd "$scriptDir/.." && pwd )"
region="eu-west-1"
codeBucket=
stackName=

usage="usage: $script [-b|-h|-r|-s]
    -b| --bucket        the name of the S3 bucket used for the source code of SAM resources
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
        -b|--bucket)
        codeBucket="$2"
        shift
        ;;
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

if [[ -z $stackName ]]; then
    echo "Stackname must be given by either --stack-name or -s"
    exit 1
fi

if [[ -z $codeBucket ]]; then
    echo "Bucket must be given by either --bucket or -b"
    exit 1
fi

echo "#################################################################"
echo "Packaging CloudFormation template"
echo "#################################################################"

aws cloudformation package \
    --template-file ${rootDir}/api.sam.yaml \
    --region ${region} \
    --s3-bucket ${codeBucket} \
    --output-template-file api.sam.output.yaml

echo "#################################################################"
echo "Deploying stack $stackName"
echo "#################################################################"


aws cloudformation deploy \
    --template-file ${rootDir}/api.sam.output.yaml \
    --region ${region} \
    --stack-name ${stackName} \
    --capabilities CAPABILITY_NAMED_IAM


apiId=(`aws cloudformation describe-stack-resources --stack-name $stackName \
    --query "StackResources[?ResourceType == 'AWS::ApiGateway::RestApi'].PhysicalResourceId" \
    --region $region \
    --output text`)


apiUrl="https://$apiId.execute-api.$region.amazonaws.com/Prod"

echo "#################################################################"
echo "Deployed API to $apiUrl"
echo "#################################################################"

./scripts/test-stack.sh --stack-name $stackName --region $region
