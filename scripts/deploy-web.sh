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

if [[ -z $stackName ]]; then
    echo "You must specify stack name using -s or --stack-name"
    exit 1
fi

cd "$clientDir"

# Get the URL to the backend environment and update the production settings.
apiId=(`aws cloudformation describe-stack-resources --stack-name $stackName \
    --query "StackResources[?ResourceType == 'AWS::ApiGateway::RestApi'].PhysicalResourceId" \
    --region $region \
    --output text`)
apiUrl="https://$apiId.execute-api.$region.amazonaws.com/Prod"
sed -i -- "s,API_URL,$apiUrl,g" src/environments/environment.prod.ts


# Install angular and all dependencies and package the app.
npm install
./node_modules/.bin/ng build --prod
cp ./src/error.html ./dist

# Retreive the bucket name and upload the packaged app and allow public
# reads to the objects.
bucketName=(`aws cloudformation describe-stacks --stack-name $stackName \
    --query "Stacks[0].Outputs[?OutputKey == 'WebBucketName'].OutputValue" \
    --region $region \
    --output text`)
aws s3 sync dist/ s3://$bucketName/ --acl public-read

url=(`aws cloudformation describe-stacks --stack-name $stackName \
    --query "Stacks[0].Outputs[?OutputKey == 'WebsiteURL'].OutputValue" \
    --region $region \
    --output text`)
echo "Deployed the app at $url"
