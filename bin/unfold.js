#!/usr/bin/env node

'use strict';

const OS = require('os');
const Program = require('commander');
const ConfigFile = require('./config-file');

global.homeDirectory = OS.homedir();
global.scriptDirectory = __dirname;
global.workingDirectory = process.cwd();

global.profileConfig = null;
global.deploymentConfig = null;

// starts arg parsing
Program
  .version('0.1.0')
  .option('--auth', 'authenticates with DigitalOcean')
  .option('--create', 'create new deployment')
  .option('--update', 'update application in stack [TODO]')
  .option('--stacks [wide]', 'list all deployed droplets')
  .option('--ssh-keys', 'lists available ssh keys under account')
  .option('--destroy', 'destroy all deployed instances with deployment tag')
  .parse(process.argv);

// empty line for better readability
console.log();

if (Program.auth) {
  const auth = require('./commands/auth');
  auth(Program.auth);
};

if (Program.create) {
  ConfigFile.profile();
  ConfigFile.deployment();

  const create = require('./commands/create');
  create(Program.create);
};

if (Program.update) {
  ConfigFile.profile();
  ConfigFile.deployment();

  const update = require('./commands/update');
  update(Program.update);
};

if (Program.stacks) {
  ConfigFile.profile();
  ConfigFile.deployment();

  const stacks = require('./commands/stacks');
  stacks(Program.stacks);
};

if (Program.sshKeys) {
  ConfigFile.profile();
  ConfigFile.deployment();

  const sshKeys = require('./commands/ssh-keys');
  sshKeys(Program.sshKeys);
};

if (Program.destroy) {
  ConfigFile.profile();
  ConfigFile.deployment();

  const destroy = require('./commands/destroy');
  destroy(Program.destroy);
};
