#!/bin/bash

ssh "root@$1" pm2 logs --nostream
