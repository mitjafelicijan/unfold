const Request = require('sync-request');
const Util = require('util');
const Path = require('path');
const execSync = require('child_process').execSync;
const Colors = require('colors');
const Inquirer = require('inquirer');

module.exports = async (subcommand) => {

  let confirm = await Inquirer
    .prompt([
      {
        type: 'input',
        name: 'proceed',
        message: 'Do you really want to deploy this version?',
        default: () => {
          return 'yes';
        },
      }
    ]);


  if (!['y', 'yes'].includes(confirm.proceed.toLowerCase())) {
    process.exit(1);
  }

  console.log();

  const res = Request('GET', `https://api.digitalocean.com/v2/droplets?tag_name=${deploymentConfig.deployment.tag}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });

  const results = JSON.parse(res.getBody('utf8'));

  for (const droplet of results.droplets) {
    let publicIp = null;
    for (const ipv4 of droplet.networks.v4) {
      if (ipv4.type == 'public') {
        publicIp = ipv4.ip_address;
      }
    }

    Util.log(`Deploying to droplet '${droplet.name}' with ip ${publicIp} ...`.yellow);

    try {
      const packageScript = Path.join(scriptDirectory, `../buildpacks/${deploymentConfig.application.buildpack}/deploy.sh`);
      execSync(`bash ${packageScript} ${publicIp}`, {
        timeout: 60000,
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      Util.log(`Deployment to droplet '${droplet.name}' with ip ${publicIp} succeeded`.green);
    } catch (error) {
      Util.log(`Deployed to droplet '${droplet.name}' with ip ${publicIp} failed`.red);
    }
  }

};
