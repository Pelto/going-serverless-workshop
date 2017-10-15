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

echo "Emptying bucket before terminating stack..."

# We can only delete buckets that are empty, so before terminating the stack
# we will manually remove the bucket and all objects in it.
bucketName=(`aws cloudformation describe-stacks --stack-name $stackName \
    --query "Stacks[0].Outputs[?OutputKey == 'WebBucketName'].OutputValue" \
    --region $region \
    --output text`)
aws s3 rb s3://$bucketName --force

echo "Deleting the stack..."

aws cloudformation delete-stack --stack-name $stackName
