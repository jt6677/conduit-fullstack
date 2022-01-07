#!/bin/bash
echo "starting deploy dockerdeploy.sh"

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

reboot