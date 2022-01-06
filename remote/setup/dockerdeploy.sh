#!/bin/bash
DB_NAME=conduit
DB_USER=postgres
FRONTEND_IMG_URL=gcr.io/caramel-hallway-333402/frontend:latest
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
    lsb-release --yes

curl -fsSL https://download.docker.com/linux/ubuntu/gpg --yes| sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg --yes

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

#install docker
apt-get update --yes
apt-get install docker-ce docker-ce-cli containerd.io --yes 

#install psql image
#create volume
docker create volume pgdata 
#run psql image
# docker run -p 5432:5432 -d \
#     -e POSTGRES_PASSWORD=postgres \
#     -e POSTGRES_USER=postgres \
#     -e POSTGRES_DB=postgres \
#     -v pgdata:/var/lib/postgresql/data \
#     postgres
# docker run -p 5432:5432 -d \
#     -e POSTGRES_PASSWORD='${DB_PASSWORD}'\
#     -e POSTGRES_USER='${DB_USER}'\
#     -e POSTGRES_DB='${DB_NAME}' \
#     -v pgdata:/var/lib/postgresql/data \
#     postgres

# Install Caddy (see https://caddyserver.com/docs/install#debian-ubuntu-raspbian).
apt --yes install -y debian-keyring debian-archive-keyring apt-transport-https
curl -L --yes https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo apt-key --yes add - 
curl -L https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | sudo tee -a /etc/apt/sources.list.d/caddy-stable.list --yes
apt update --yes
apt --yes install caddy

#add google container registry credentials 
cd setup
cat keyfile.json | docker login -u _json_key --password-stdin https://gcr.io
docker run -d -p 3000:3000  ${FRONTEND_IMG_URL}
docker run -d -p 8080:8080  ${BACKEND_IMG_URL}
