#!/bin/bash

ssh "root@$1" cat /var/log/nginx/error.log
