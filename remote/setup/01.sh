#!/bin/bash
# ==================================================================================== #
# SCRIPT LOGIC
# ==================================================================================== #
echo "let go!"

# Update all software packages. Using the --force-confnew flag means that configuration 
# files will be replaced if newer ones are available.
apt update
apt install software-properties-common
apt --yes -o Dpkg::Options::="--force-confnew" upgrade


# Enable the "universe" repository.
add-apt-repository --yes universe
# Add the new user (and give them sudo privileges).
# useradd --create-home --shell "/bin/bash" --groups sudo "${USERNAME}"

# Force a password to be set for the new user the first time they log in.
# passwd --delete "${USERNAME}"
# chage --lastday 0 "${USERNAME}"

# Copy the SSH keys from the root user to the new user.
# rsync --archive --chown=${USERNAME}:${USERNAME} /root/.ssh /home/${USERNAME}


# Install PostgreSQL.
apt --yes install postgresql

# Set up the jtforward DB and create a user account with the password entered earlier.
sudo -i -u postgres psql -c "CREATE DATABASE conduit"
sudo -i -u postgres psql -c "ALTER USER postgres WITH PASSWORD '123321'"
sudo -i -u postgres psql -d conduit -c "CREATE EXTENSION IF NOT EXISTS citext"
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