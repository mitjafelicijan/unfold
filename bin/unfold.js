#!/usr/bin/env node

'use strict';

const FS = require('fs');
const Path = require('path');
const Program = require('commander');
const YAML = require('yaml');

global.scriptDirectory = __dirname;
global.settingsDirectory = `${__dirname}/home/.unfold`; // replace with /home/{USER}/.unfold
global.workingDirectory = process.cwd();

// starts arg parsing
Program
  .version('0.1.0')
  .option('--auth', 'authenticates with DigitalOcean')
  .option('--create', 'create new deployment')
  .option('--update', 'update application in stack')
  .option('--stacks [wide]', 'list all deployed droplets')
  .option('--ssh-keys', 'lists available ssh keys under account')
  .option('--destroy', 'destroy all deployed instances with deployment tag')
  .parse(process.argv);


// parse deployment file
if (!FS.existsSync(Path.join(workingDirectory, 'deployment.yml'))) {
  console.log('Deployment file deployment.yml does not exist.');
  process.exit(1);
}
global.deploymentConfig = YAML.parse(FS.readFileSync(Path.join(workingDirectory, 'deployment.yml'), 'utf8'));

// parse profile file
if (!FS.existsSync(Path.join(settingsDirectory, 'profile.yml'))) {
  console.log('Profile file profile.yml does not exist.');
  process.exit(1);
}
global.profileConfig = YAML.parse(FS.readFileSync(Path.join(settingsDirectory, 'profile.yml'), 'utf8'));

// empty line for better readability
console.log();

if (Program.auth) {
  const auth = require('./commands/auth');
  auth(Program.auth);
};

if (Program.create) {
  const create = require('./commands/create');
  create(Program.create);
};

if (Program.update) {
  const update = require('./commands/update');
  update(Program.update);
};

if (Program.stacks) {
  const stacks = require('./commands/stacks');
  stacks(Program.stacks);
};

if (Program.sshKeys) {
  const sshKeys = require('./commands/ssh-keys');
  sshKeys(Program.sshKeys);
};

if (Program.destroy) {
  const destroy = require('./commands/destroy');
  destroy(Program.destroy);
};
