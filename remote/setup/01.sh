#!/bin/bash
backendDir=/etc/www/backend
frontendDir=/etc/www/frontend
# Navigate to root directory and make /etc/www/backend and /etc/www/frontend
echo "starting deploy 01.sh"
mkdir -p '$backendDir'
mkdir -p '$frontendDir'
# Update all software packages. Using the --force-confnew flag means that configuration 
# files will be replaced if newer ones are available.
apt update
apt install software-properties-common
apt --yes -o Dpkg::Options::="--force-confnew" upgrade
# Enable the "universe" repository.
add-apt-repository --yes universe


# Copy the SSH keys from the root user to the new user.
# rsync --archive --chown=${USERNAME}:${USERNAME} /root/.ssh /home/${USERNAME}


# Install PostgreSQL.
apt --yes install postgresql

# Set up the jtforward DB and create a user account with the password entered earlier.
sudo -i -u postgres psql -c "CREATE DATABASE fftimer"
sudo -i -u postgres psql -c "ALTER USER postgres WITH PASSWORD '123321'"
sudo -i -u postgres psql -d fftimer -c "CREATE EXTENSION IF NOT EXISTS citext"
# sudo -i -u postgres psql -d fftimer -c "CREATE ROLE jtforward WITH LOGIN PASSWORD '${DB_PASSWORD}'"
# sudo -i -u postgres psql -d fftimer -c "CREATE ROLE jtforward WITH LOGIN PASSWORD '123321'"


# Install Caddy (see https://caddyserver.com/docs/install#debian-ubuntu-raspbian).
apt --yes install -y debian-keyring debian-archive-keyring apt-transport-https
curl -L https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo apt-key add -
curl -L https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | sudo tee -a /etc/apt/sources.list.d/caddy-stable.list
apt update
apt --yes install caddy

echo "Script complete! Rebooting..."
reboot