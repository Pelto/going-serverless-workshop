#!/usr/bin/env bash

set -e


script=$(basename $0)
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
rootDir="$( cd "$scriptDir/.." && pwd )"
region="eu-west-1"
samBucket="going-serverless"
stackName="Rock-Paper-Scissors"

usage="usage: $script [-b|-h|-r|-s]
    -b| --bucket        the name of the S3 bucket used for SAM resources
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
        samBucket="$2"
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

aws cloudformation package \
    --template-file ${rootDir}/cloudformation.sam.yaml \
    --region ${region} \
    --s3-bucket ${samBucket} \
    --output-template-file cloudformation.sam.output.yaml