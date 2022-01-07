#!/bin/bash
FRONTEND=gcr.io/caramel-hallway-333402/frontend:latest
BACKEND=gcr.io/caramel-hallway-333402/backend:latest
echo "starting update updatecontainers.sh"
# docker compose down
cd / &&  cd root/remote/production && docker-compose down 
cd / && cd root/remote/setup && cat keyfile.json | docker login -u _json_key --password-stdin https://gcr.io	
#delete old images
docker rmi -f $(docker images '${FRONTEND}' -a -q)
docker rmi -f $(docker images '${BACKEND}' -a -q)
#pull new images
docker pull  ${FRONTEND}
docker pull  ${BACKEND}
# docker-compose up -d
cd / &&  cd root/remote/production && docker-compose up -d 