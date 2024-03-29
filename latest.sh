#!/bin/sh

set -eux

REGISTRY=200.129.37.136:5000
IMAGE_NAME=puppeteer

sudo docker build $(dirname $0) -t $IMAGE_NAME
sudo docker tag $IMAGE_NAME $REGISTRY/$IMAGE_NAME
sudo docker push $REGISTRY/$IMAGE_NAME