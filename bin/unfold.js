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
  .option('--init', 'initializes new deployment.yml config file')
  .option('--create', 'create new deployment')
  .option('--deploy', 'deploys new version of the application')
  .option('--logs <dropletId>', 'fetches latest logs from instances')
  .option('--resources [wide]', 'list all deployed resources')
  .option('--ssh-keys', 'lists available ssh keys under account')
  .option('--destroy', 'destroy all deployed instances with deployment tag')
  .option('--balance', 'shows current balance in account')
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

if (Program.init) {
  ConfigFile.profile();

  const init = require('./commands/init');
  init(Program.init);
};

if (Program.deploy) {
  ConfigFile.profile();
  ConfigFile.deployment();

  const deploy = require('./commands/deploy');
  deploy(Program.deploy);
};

if (Program.logs) {
  ConfigFile.profile();
  ConfigFile.deployment();

  const logs = require('./commands/logs');
  logs(Program.logs);
};

if (Program.resources) {
  ConfigFile.profile();
  ConfigFile.deployment();

  const resources = require('./commands/resources');
  resources(Program.resources);
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

if (Program.balance) {
  ConfigFile.profile();
  ConfigFile.deployment();

  const balance = require('./commands/balance');
  balance(Program.balance);
};
