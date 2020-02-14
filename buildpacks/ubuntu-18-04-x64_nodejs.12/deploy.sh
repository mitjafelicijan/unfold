#!/bin/bash

APP_NAME="app.zip"
REMOTE_DESTINATION="/var/unfold/"
cd $PWD

mkdir -p .unfold
zip -r ".unfold/$APP_NAME" ./ -x "node_modules/*"

cat >".unfold/deploy.sh" <<EOL
#!/bin/bash

mkdir -p ${REMOTE_DESTINATION}
rm -Rf ${REMOTE_DESTINATION}*
unzip /tmp/$APP_NAME -d ${REMOTE_DESTINATION}
cd ${REMOTE_DESTINATION}
npm install
pm2 delete all
pm2 start app.js -i max
EOL

cd .unfold
scp "$APP_NAME" "root@$1:/tmp/$APP_NAME"
scp "deploy.sh" "root@$1:/tmp/deploy.sh"
ssh "root@$1" bash "/tmp/deploy.sh"

cd ..
rm -Rf .unfold/
