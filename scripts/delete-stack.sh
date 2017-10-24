#!/usr/bin/env bash

set -e

script=$(basename $0)
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( cd "$scriptDir/.." && pwd )"
region="eu-west-1"
apiStackName=
webStackName=

usage="usage: $script [-h|-r|-a|-w]
    -h| --help              this help
    -r| --region            AWS region (defaults to '$region')
    -a| --api-stack-name    API stack name
    -w| --web-stack-name    web stack name"


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
        -w|--web-stack-name)
        webStackName="$2"
        shift
        ;;
        *)
        # Unknown option
        ;;
    esac
    shift # past argument or value
done


if [[ -n $apiStackName ]]; then

    echo "Deleting the API stack $apiStackName"

    aws cloudformation delete-stack --stack-name $apiStackName --region $region
fi


if [[ -n $webStackName ]]; then

    # We can only delete buckets that are empty, so before terminating the web stack
    # we will manually remove the bucket and all objects in it.
    bucketName=(`aws cloudformation describe-stacks --stack-name $webStackName \
        --query "Stacks[0].Outputs[?OutputKey == 'WebBucketName'].OutputValue" \
        --region $region \
        --output text`)

    echo "Emptying WebBucket $bucketName before terminating stack..."

    aws s3 rb s3://$bucketName --force

    echo "Deleting the web stack $webStackName"

    aws cloudformation delete-stack --stack-name $webStackName --region $region
fi
