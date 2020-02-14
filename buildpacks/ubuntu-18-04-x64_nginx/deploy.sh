#!/bin/bash

APP_NAME="app.zip"
REMOTE_DESTINATION="/var/www/html/"
cd $PWD

mkdir -p .unfold
zip -r ".unfold/$APP_NAME" ./

cat >".unfold/deploy.sh" <<EOL
#!/bin/bash

mkdir -p ${REMOTE_DESTINATION}
rm -Rf ${REMOTE_DESTINATION}*
unzip /tmp/$APP_NAME -d ${REMOTE_DESTINATION}
EOL

cd .unfold
scp "$APP_NAME" "root@$1:/tmp/$APP_NAME"
scp "deploy.sh" "root@$1:/tmp/deploy.sh"
ssh "root@$1" bash "/tmp/deploy.sh"

cd ..
rm -Rf .unfold/
