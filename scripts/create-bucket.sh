#!/usr/bin/env bash

set -e


script=$(basename $0)
region="eu-west-1"
codeBucket=

usage="usage: $script [-b|-h|-r|-a]
    -b| --bucket            the name of the S3 bucket used for the source code of SAM resources
    -h| --help              this help
    -r| --region            AWS region (defaults to '$region')"


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
        *)
        # Unknown option
        ;;
    esac
    shift # past argument or value
done

if [[ -z $codeBucket ]]; then
    echo "Bucket name must be provided by either --bucket or -b"
    exit 1
fi

aws s3api create-bucket --bucket $codeBucket --create-bucket-configuration LocationConstraint=$region