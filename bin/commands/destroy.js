const Util = require('util');
const Request = require('sync-request');
const Colors = require('colors');
const ReadlineSync = require('readline-sync');

module.exports = async (subcommand) => {

  // prompt user for acceptance
  console.log('Are you sure you want to destroy this stack? [yes/no]')
  const accept = ReadlineSync.prompt()
  if (!['y', 'yes'].includes(accept.toLowerCase())) {
    process.exit(1);
  }
  console.log();

  // creates droplet
  const res = Request('DELETE', `https://api.digitalocean.com/v2/droplets?tag_name=${deploymentConfig.deployment.tag}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });

  Util.log(`Request for deletion of stack with tag '${deploymentConfig.deployment.tag}' sent to DigitalOcean`.red);

};
