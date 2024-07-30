#! /bin/bash
# Ubuntu 22.04

# Update and upgrade
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
## Add Docker's official GPG key:
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

## Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

## Install Docker Engine
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Install NodeJS
## Install curl
sudo apt-get install -y curl

## Install NodeJS
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt-get install -y nodejs

# Update and upgrade
sudo apt-get update && sudo apt-get upgrade -y

## Create postgres command
echo "# Create postgres command
alias postgres_start='sudo docker run --name postgres-sql -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres && docker exec -it postgres-sql psql -U postgres -c \"CREATE DATABASE postgres\"; sudo docker start postgres-sql'
alias postgres_stop='sudo docker stop postgres-sql && sudo docker rm postgres-sql'" >> ~/.bashrc

## Create custom command
echo "# Create custom command
alias docker_stop='sudo docker stop $(docker ps -a -q) && sudo docker rm $(docker ps -a -q)'
alias pm2_stop='pm2 stop all && pm2 delete all || sudo pm2 stop all && sudo pm2 delete all'" >> ~/.bashrc

source ~/.bashrc

# Install postgresql by Docker
sudo docker run --name postgres-sql -p 5432:5432 -e POSTGRES_PASSWORD=postgres -d postgres
sudo docker exec -it postgres-sql psql -U postgres -c "CREATE DATABASE postgres"
sudo docker start postgres-sql