#!/bin/bash

# general system stuff
apt update

# provision commands go here
apt install -y zip unzip nginx
hostname > /var/www/html/index.html

# signal that the provision is done
# DO NOT REMOVE THIS!
echo "YES" > /root/provision_completed
