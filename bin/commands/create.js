const FS = require('fs');
const Util = require('util');
const Path = require('path');
const Request = require('sync-request');
const UUID = require('short-uuid');
const Sleep = require('system-sleep');
const Colors = require('colors');
const execSync = require('child_process').execSync;
const ReadlineSync = require('readline-sync');

module.exports = async (subcommand) => {

  console.log('Deployment:'.bold.underline);
  console.log('Name:', deploymentConfig.deployment.name);
  console.log('Tag:', deploymentConfig.deployment.tag);
  console.log('Region:', deploymentConfig.deployment.region);
  console.log();

  console.log('Application:'.bold.underline);
  console.log('Buildpack:', deploymentConfig.application.buildpack);
  console.log('Replicas:', deploymentConfig.application.replicas);
  console.log();

  for (const service of deploymentConfig.services) {
    switch (service.kind) {
      case 'loadbalancer': {
        console.log(`Service:`.bold.underline);
        console.log('Kind:', service.kind);
        console.log('Rules:');
        for (const rule of service.rules) {
          console.log(' - Protocol:', rule.protocol);
          console.log('   Port:', rule.port);
          console.log('   Target port:', rule.targetPort);
        }
        console.log();
        break;
      }
    }
  }

  // prompt user for acceptance
  console.log('Are you sure you want to create this stack? [yes/no]')
  const accept = ReadlineSync.prompt()
  if (!['y', 'yes'].includes(accept.toLowerCase())) {
    process.exit(1);
  }
  console.log();

  // message before starting
  console.log('This proccess with take couple of minutes so be patient and don\'t exit the script.'.green.bold);
  console.log();

  // buildpack script
  const buildpackFile = Path.join(scriptDirectory, `buildpacks/${deploymentConfig.application.buildpack}.sh`);
  if (!FS.existsSync(buildpackFile)) {
    console.log(`Buildpack definition for ${deploymentConfig.application.buildpack} does not exist.`);
    process.exit(1);
  }
  const buildpack = FS.readFileSync(buildpackFile, 'utf8');

  // generates N ammount of instances names based on replica count in deployment file
  const instances = Array(deploymentConfig.application.replicas).fill().map((v, i) => `${deploymentConfig.deployment.name}-${UUID.generate()}`);

  // starts spinner
  Util.log('Request for droplet creation sent to DigitalOcean');

  // creates droplets
  const res = Request('POST', 'https://api.digitalocean.com/v2/droplets', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
    json: {
      names: instances,
      region: deploymentConfig.deployment.region,
      size: 's-1vcpu-1gb',
      image: deploymentConfig.application.buildpack.split('_')[0],
      backups: false,
      ipv6: true,
      private_networking: true,
      volumes: null,
      ssh_keys: deploymentConfig.deployment.sshKeys,
      user_data: buildpack,
      tags: [deploymentConfig.deployment.tag],
    },
  });

  const results = JSON.parse(res.getBody('utf8'));
  const createdDroplets = Array();
  for (const droplet of results.droplets) {
    createdDroplets.push({
      id: droplet.id,
      name: droplet.name,
      provisioned: false,
      installed: false,
      ipv4: null,
    });
  }

  // install software on droplets
  let allDropletsCompleted = false;
  while (!allDropletsCompleted) {
    //console.log('==> new tick');
    for (const droplet of createdDroplets) {

      // trying to get ip from a droplet
      if (droplet.ipv4 == null) {
        try {
          const res = Request('GET', `https://api.digitalocean.com/v2/droplets/${droplet.id}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${profileConfig.apiKey}`,
            },
          });

          const results = JSON.parse(res.getBody('utf8'));
          let publicIp = null;
          for (const ipv4 of results.droplet.networks.v4) {
            if (ipv4.type == 'public') {
              publicIp = ipv4.ip_address;
            }
          }

          if (publicIp) {
            droplet.ipv4 = publicIp;
            Util.log(`Droplet ${droplet.name.cyan} registered with ip ${droplet.ipv4.magenta}`);
            Util.log(`Wating for droplet ${droplet.name.cyan} to be provisioned`);
          }
        } catch (error) { }
      }

      // check if droplet provisioned
      if (!droplet.provisioned && droplet.ipv4 != null) {
        try {
          const remoteProvisionFile = execSync(`ssh -o "StrictHostKeyChecking no" root@${droplet.ipv4} cat /root/install_completed`, {
            timeout: 5000,
            stdio: ['pipe', 'pipe', 'ignore'],
          });

          if (remoteProvisionFile.toString().trim() == 'YES') {
            droplet.provisioned = true;
            Util.log(`Droplet ${droplet.name.cyan} succesfully provisioned`);
          }
        } catch (error) { }
      }
    }

    // check for exit conditions
    let cantExit = true;
    for (const droplet of createdDroplets) {
      if (droplet.ipv4 == null || !droplet.provisioned) { //  || !droplet.installed
        cantExit = false;
        break;
      }
    }

    if (cantExit) {
      Util.log('All droplets provisioned and installed'.green);
      allDropletsCompleted = true
    };

    // wait for N seconds before next try
    Sleep(5000);
  }

  // creates additional services
  Util.log('Starting to provision services');
  for (const service of deploymentConfig.services) {
    if (service.kind == 'loadbalancer') {
      const dropletIDs = Array();
      for (const droplet of createdDroplets) {
        dropletIDs.push(droplet.id)
      }

      const forwardingRules = Array();
      for (const rule of service.rules) {
        forwardingRules.push({
          entry_protocol: rule.protocol,
          entry_port: rule.port,
          target_protocol: rule.protocol,
          target_port: rule.port,
          tls_passthrough: rule.protocol == 'https' ? true : false,
        })
      }

      const res = Request('POST', 'https://api.digitalocean.com/v2/load_balancers', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${profileConfig.apiKey}`,
        },
        json: {
          name: `lb-${deploymentConfig.deployment.name}-${UUID.generate()}`,
          region: deploymentConfig.deployment.region,
          sticky_sessions: { type: 'none' },
          droplet_ids: dropletIDs,
          forwarding_rules: forwardingRules,
          health_check: {
            protocol: 'http',
            port: 80,
            path: service.healthcheck,
            check_interval_seconds: 10,
            response_timeout_seconds: 5,
            healthy_threshold: 5,
            unhealthy_threshold: 3
          }
        },
      });
      Util.log('Load balancer created but it will take couple of minutes to propagate'.green);
    }
  }

};
