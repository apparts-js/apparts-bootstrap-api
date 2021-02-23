#!/bin/bash

rm *.zip
rm -r ./node_modules

npm install --production

zip -r lambda.zip ./*

aws --region "$1" lambda update-function-code --function-name "$2" --zip-file fileb://$(pwd)/lambda.zip
