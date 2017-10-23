#!/usr/bin/env bash

set -e

script=$(basename $0)
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( cd "$scriptDir/.." && pwd )"
clientDir="$rootDir/rps-client"
region="eu-west-1"

usage="usage: $script [-w|--webstack-name -r|--region -a | --api-stack-name -h|--help]
    -h| --help              this help
    -r| --region            AWS region (defaults to '$region')
    -w| --web-stack-name        web stack name
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
        -w|--web-stack-name)
        webStackName="$2"
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

if [[ -z $webStackName ]]; then
    echo "You must specify web stack name using -w or --web-stack-name"
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

echo "#################################################################"
echo "Deploying web stack $webStackName"
echo "#################################################################"

# Deploy the web stack
aws cloudformation deploy \
    --stack-name $webStackName \
    --template-file web.cfn.yaml \
    --parameter-overrides APIGatewayOriginDomain=$apiGatewayOriginDomain \
    --region $region

# Install angular and all dependencies and package the app.
cd $clientDir
npm install
./node_modules/.bin/ng build --prod
cp ./src/error.html ./dist

# Retrieve the bucket name and upload the packaged app and allow public
# reads to the objects.
bucketName=(`aws cloudformation describe-stacks --stack-name $webStackName \
    --query "Stacks[0].Outputs[?OutputKey == 'WebBucketName'].OutputValue" \
    --region $region \
    --output text`)

aws s3 sync dist/ s3://$bucketName/ --acl public-read

# Fetch CloudFront url
url=(`aws cloudformation describe-stacks --stack-name $webStackName \
    --query "Stacks[0].Outputs[?OutputKey == 'CloudFrontDistributionUrl'].OutputValue" \
    --region $region \
    --output text`)

echo "#################################################################"
echo "Deployed CDN to $url"
echo "#################################################################"
