#!/bin/bash

# general system stuff
apt update

# provision commands go here
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt install -y build-essential gcc g++ make sqlite3 zip unzip nodejs
npm i -g pm2

# signal that the provision is done
# DO NOT REMOVE THIS!
echo "YES" > /root/provision_completed
