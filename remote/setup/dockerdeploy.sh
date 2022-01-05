#!/bin/bash
DB_NAME=conduit
DB_USER=postgres
FRONTEND_IMG_URL=gcr.io/caramel-hallway-333402/backend:latest
BACKEND_IMG_URL=gcr.io/caramel-hallway-333402/backend:latest
# Prompt to enter a password for the PostgreSQL greenlight user (rather than hard-coding
# a password in this script).
read -p "Enter password for greenlight DB user: " DB_PASSWORD
echo "starting deploy dockerdeploy.sh"
# Update all software packages. Using the --force-confnew flag means that configuration 
# files will be replaced if newer ones are available.
apt-get update

#Set up the repository
apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

#install docker
apt-get update
apt-get install docker-ce docker-ce-cli containerd.io 

#install psql image
#create volume
docker create pgdata 
#run psql image
docker run -p 5432:5432 -d \
    -e POSTGRES_PASSWORD='${DB_PASSWORD}'\
    -e POSTGRES_USER='${DB_USER}'\
    -e POSTGRES_DB='${DB_NAME}' \
    -v pgdata:/var/lib/postgresql/data \
    postgres

# Install Caddy (see https://caddyserver.com/docs/install#debian-ubuntu-raspbian).
apt --yes install -y debian-keyring debian-archive-keyring apt-transport-https
curl -L https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo apt-key add -
curl -L https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | sudo tee -a /etc/apt/sources.list.d/caddy-stable.list
apt update
apt --yes install caddy

docker pull ${FRONTEND_IMG_URL}
docker pull ${BACKEND_IMG_URL}
echo "Script complete! Rebooting..."
reboot