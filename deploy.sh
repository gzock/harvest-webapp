#!/bin/bash
set -ueE

cd dist/harvest-webapp

sleep 10

aws s3 sync . s3://product-harvest-webapp --include "*" --cache-control "max-age=3600" --delete --exact-timestamps
aws cloudfront create-invalidation --distribution-id E190IJHVIC9O74 --paths '/*'
