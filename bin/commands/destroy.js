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

  // deletes droplets with tag in deployment
  Request('DELETE', `https://api.digitalocean.com/v2/droplets?tag_name=${deploymentConfig.deployment.tag}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });
  Util.log(`Deleting droplets with tag '${deploymentConfig.deployment.tag}'`.red);


  // deleting load balancer
  const res = Request('GET', 'https://api.digitalocean.com/v2/load_balancers', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });

  const results = JSON.parse(res.getBody('utf8'));

  let loadBalancerID = null;
  for (const loadBalancer of results.load_balancers) {
    if (loadBalancer.tag == deploymentConfig.deployment.tag) {
      loadBalancerID = loadBalancer.id;
      break;
    }
  }

  if (loadBalancerID) {
    Request('DELETE', `https://api.digitalocean.com/v2/load_balancers/${loadBalancerID}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${profileConfig.apiKey}`,
      },
    });
    Util.log(`Deleting load balancer with tag '${deploymentConfig.deployment.tag}'`.red);
  }

};
