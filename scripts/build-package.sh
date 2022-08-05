#!/usr/bin/env bash

APP_ENV=production yarn build \
  && cp manifest.json dist \
  && cd dist \
  && zip -r "app.zip" .
