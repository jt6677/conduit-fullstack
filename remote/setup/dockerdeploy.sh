#!/bin/bash
frontendDir=/etc/www/frontend
# Navigate to root directory and make /etc/www/backend and /etc/www/frontend
echo "starting deploy dockerdeploy.sh"
mkdir -p '$frontendDir'
# Update all software packages. Using the --force-confnew flag means that configuration 
# files will be replaced if newer ones are available.
apt update
apt install software-properties-common
apt --yes -o Dpkg::Options::="--force-confnew" upgrade
# Enable the "universe" repository.
add-apt-repository --yes universe

# Install Caddy (see https://caddyserver.com/docs/install#debian-ubuntu-raspbian).
apt --yes install -y debian-keyring debian-archive-keyring apt-transport-https
curl -L https://dl.cloudsmith.io/public/caddy/stable/gpg.key | sudo apt-key add -
curl -L https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt | sudo tee -a /etc/apt/sources.list.d/caddy-stable.list
apt update
apt --yes install caddy

echo "Script complete! Rebooting..."
reboot