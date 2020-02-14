#!/bin/bash

# general system stuff
apt update

# provision commands go here
curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh
bash nodesource_setup.sh
apt install -y build-essential nodejs gcc g++ make sqlite3 unzip

# signal that the provision is done
# DO NOT REMOVE THIS!
echo "YES" > /root/install_completed
