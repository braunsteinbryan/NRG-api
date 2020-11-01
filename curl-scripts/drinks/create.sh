#!/bin/bash

API="http://localhost:4741"
URL_PATH="/drinks"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "drink": {
      "brand": "'"${BRAND}"'",
      "flavor": "'"${FLAVOR}"'",
      "img": "'"${IMG}"'"
    }
  }'

echo
