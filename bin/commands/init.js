const FS = require('fs');
const Util = require('util');
const Path = require('path');
const Request = require('sync-request');
const Inquirer = require('inquirer');
const Colors = require('colors');
const Mustache = require('mustache');
const Slugify = require('slugify');

module.exports = async (subcommand) => {

  // generates list of available regions
  Util.log('Fetching information about available regions ...'.green);
  let regionsResponse = Request('GET', 'https://api.digitalocean.com/v2/regions', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });
  regionsResponse = JSON.parse(regionsResponse.getBody('utf8'));

  const regions = Array();
  for (const region of regionsResponse.regions) {
    regions.push(`${region.slug} (${region.name})`);
  }

  // generates list of available sizes
  Util.log('Fetching information about available droplet sizes ...'.green);
  let sizesResponse = Request('GET', 'https://api.digitalocean.com/v2/sizes', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });
  sizesResponse = JSON.parse(sizesResponse.getBody('utf8'));

  const sizes = Array();
  for (const size of sizesResponse.sizes) {
    if (size.slug.startsWith('s-')) {
      sizes.push(`${size.slug} ($${size.price_monthly}/month, ${size.memory}MB RAM, ${size.disk}GB disk, ${size.vcpus} vcpus)`);
    }
  }

  // generates list of available buildpacks
  Util.log('Fetching information about available buildpacks ...'.green);
  const buildpacksDirectory = Path.join(scriptDirectory, '../buildpacks');
  const buildpackFiles = FS.readdirSync(buildpacksDirectory);
  const buildpacks = Array();

  for (const buildpack of buildpackFiles) {
    buildpacks.push(buildpack.replace('.sh', ''));
  }

  // generates list of available available keys
  Util.log('Fetching information about available SSH keys ...'.green);
  let sshKeysResponse = Request('GET', 'https://api.digitalocean.com/v2/account/keys', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });
  sshKeysResponse = JSON.parse(sshKeysResponse.getBody('utf8'));

  const sshKeys = Array();
  for (const key of sshKeysResponse.ssh_keys) {
    sshKeys.push(`${key.id} (${key.name})`);
  }

  console.log();

  let initConfig = await Inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of your application?',
        validate: (val) => {
          if (val.length == 0) {
            return 'You must provide a name of application.';
          }
          return true;
        },
        filter: (val) => {
          return Slugify(val);
        },
      },
      {
        type: 'input',
        name: 'tag',
        message: 'What tag do you want your stack to use?',
        validate: (val) => {
          if (val.length == 0) {
            return 'You must provide a tag for application.';
          }
          return true;
        },
        filter: (val) => {
          return Slugify(val);
        },
      },
      {
        type: 'list',
        name: 'buildpack',
        message: 'What buildpack do you want to use?',
        choices: buildpacks,
      },
      {
        type: 'list',
        name: 'size',
        message: 'What droplet size do you need?',
        choices: sizes,
        filter: (val) => {
          return val.split(' ')[0];
        },
      },
      {
        type: 'list',
        name: 'region',
        message: 'Which region do you want these resources to spawn?',
        choices: regions,
        filter: (val) => {
          return val.split(' ')[0];
        },
      },
      {
        type: 'input',
        name: 'replicas',
        message: 'How many replicas do you want?',
        filter: Number,
        default: () => {
          return 1;
        },
      },
      {
        type: 'checkbox',
        name: 'loadbalancer',
        message: 'Do you want load balancer in front of the droplets?',
        choices: [{
          name: 'Yes',
          checked: true,
        }, {
          name: 'No',
        }],
        validate: (options) => {
          if (options.length > 1) {
            return 'You can choose only one option.';
          }
          return true;
        },
      },
      {
        type: 'checkbox',
        name: 'sshKeys',
        message: 'Which SSH keys do you want to grant access to droplets?',
        choices: sshKeys,
        filter: (values) => {
          values.forEach((val, idx) => {
            values[idx] = val.split(' ')[0];
          });
          return values;
        },
      }
    ]);


  const buildpackFile = Path.join(scriptDirectory, `../templates/deployment.yml`);
  const buildpack = FS.readFileSync(buildpackFile, 'utf8');

  const output = Mustache.render(buildpack, {
    name: initConfig.name,
    tag: initConfig.tag,
    region: initConfig.region,
    buildpack: initConfig.buildpack,
    size: initConfig.size,
    replicas: initConfig.replicas,
    sshKeys: initConfig.sshKeys,
    loadbalancer: initConfig.loadbalancer[0] == 'Yes' ? true : false,
  });

  console.log();
  Util.log('Writing deployment.yml file into current working directory ...'.green);
  FS.writeFileSync(Path.join(workingDirectory, 'deployment.yml'), output);

};


