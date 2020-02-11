const FS = require('fs');
const Path = require('path');
const YAML = require('yaml');
const execSync = require('child_process').execSync;
const Request = require('sync-request');
const Table = require('cli-table');

const cliScriptFolder = __dirname;
const workingDirectory = process.cwd();

const deploymentConfig = YAML.parse(FS.readFileSync(Path.join(workingDirectory, 'deployment.yml'), 'utf8'));
const profileConfig = YAML.parse(FS.readFileSync(Path.join(cliScriptFolder, 'profile.yml'), 'utf8'));

const getDroplets = async () => {
  var res = Request('GET', 'https://api.digitalocean.com/v2/droplets', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });

  const results = JSON.parse(res.getBody('utf8'));

  // display in table view
  const table = new Table({
    head: ['Name', 'Memory', 'vCPU', 'Status', 'Locked', 'Tag', 'Created at']
  });

  for (const droplet of results.droplets) {
    table.push(
      [droplet.name, droplet.memory, droplet.vcpus, droplet.status, droplet.locked, droplet.tags.join(), droplet.created_at]
    );
  }
  console.log(table.toString());
}
getDroplets();


const createDroplets = async () => {
  // gets fingerprints from deployment file for ssh access
  let fingerprints = [];
  for (const item of deploymentConfig.deployment.ssh) {
    fingerprints.push(item.fingerprint)
  }

  // buildpack script
  const buildpack = FS.readFileSync(Path.join(cliScriptFolder, `buildpacks/${deploymentConfig.application.buildpack}.sh`), 'utf8')

  // creates droplet
  const res = Request('POST', 'https://api.digitalocean.com/v2/droplets', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
    json: {
      names: ['new-one-with-buildpack'],
      region: 'nyc3',
      size: 's-1vcpu-1gb',
      image: 'ubuntu-18-04-x64',
      backups: false,
      ipv6: true,
      private_networking: true,
      volumes: null,
      ssh_keys: fingerprints,
      user_data: buildpack,
      tags: [deploymentConfig.application.tag],
    },
  });

  console.log(JSON.parse(res.getBody('utf8')));
}
//createDroplets()

// 179936378







//const file = fs.readFileSync('./file.yml', 'utf8')
//YAML.parse(file)

//code = execSync('node -v');
//console.log(code.toString());

//code = execSync('ssh root@167.172.16.46 ls -l');
//console.log(code.toString());

/*
var path, node_ssh, ssh, fs

fs = require('fs')
path = require('path')
node_ssh = require('node-ssh')
ssh = new node_ssh()

ssh.connect({
  host: '167.172.16.46',
  username: 'root',
  privateKey: '/home/m/.ssh/id_rsa'
}).then(function async() {


  // Command
  //ssh.execCommand('ls -l', { cwd: '/' }).then(function (result) {
  //  console.log('STDOUT: ' + result.stdout)
  //  //console.log('STDERR: ' + result.stderr)
  //})

  ssh.putFiles([{ local: '../dump.zip', remote: '/root/dump-remote.zip' }]).then(function () {
    console.log("The File thing is done")
  }, function (error) {
    console.log("Something's wrong")
    console.log(error)
  })

  // Command with escaped params
  ssh.exec('ls', ['-l'], { cwd: '/root/', stream: 'stdout', options: { pty: true } }).then(function (result) {
    console.log('STDOUT: ' + result)
  }).then(function () {
    console.log('stop')
  })

});
*/
