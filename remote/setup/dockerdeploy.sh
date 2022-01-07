#!/bin/bash
FRONTEND_IMG_URL=gcr.io/caramel-hallway-333402/frontend:latest
BACKEND_IMG_URL=gcr.io/caramel-hallway-333402/backend:latest
# Prompt to enter a password for the PostgreSQL greenlight user (rather than hard-coding
# a password in this script).
echo "starting deploy dockerdeploy.sh"
# Update all software packages. Using the --force-confnew flag means that configuration 
# files will be replaced if newer ones are available.
apt-get update

#Set up the repository
apt-get install \
    ca-certificates \
    curl \
    gnupg \
    docker-compose \
    lsb-release --yes

curl -fsSL https://download.docker.com/linux/ubuntu/gpg --yes| sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg --yes

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

#install docker
apt-get update --yes
apt-get install docker-ce docker-ce-cli containerd.io --yes 




#add google container registry credentials 
cd setup
cat keyfile.json | docker login -u _json_key --password-stdin https://gcr.io
docker pull  ${FRONTEND_IMG_URL}
docker pull  ${BACKEND_IMG_URL}

reboot