const Request = require('sync-request');
const Util = require('util');
const Path = require('path');
const Colors = require('colors');
const execSync = require('child_process').execSync;

module.exports = async (dropletID) => {

  const res = Request('GET', `https://api.digitalocean.com/v2/droplets/${dropletID}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });

  if (res.statusCode != 200) {
    Util.log(`Requested droplet does not exist`.red);
    process.exit(1);
  }

  const results = JSON.parse(res.getBody('utf8'));
  if (results.droplet) {
    const droplet = results.droplet;
    let publicIp = null;
    for (const ipv4 of droplet.networks.v4) {
      if (ipv4.type == 'public') {
        publicIp = ipv4.ip_address;
      }
    }

    try {
      const packageScript = Path.join(scriptDirectory, `../buildpacks/${deploymentConfig.application.buildpack}/logs.sh`);
      const logResults = execSync(`bash ${packageScript} ${publicIp}`, {
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'ignore'],
      });

      console.log(logResults.toString());

    } catch (error) {
      Util.log(`Fetching logs from droplet '${droplet.name}' with ip ${publicIp} failed`.red);
    }
  }

};
