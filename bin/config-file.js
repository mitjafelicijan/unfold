const FS = require('fs');
const Path = require('path');
const YAML = require('yaml');

module.exports.profile = async () => {
  const filepath = Path.join(homeDirectory, '/.unfold/profile.yml');
  if (!FS.existsSync(filepath)) {
    console.log('No profile detected. Please create it by using "unfold auth" command.');
    process.exit(1);
  }

  global.profileConfig = YAML.parse(FS.readFileSync(filepath, 'utf8'));
};

module.exports.deployment = async () => {
  const filepath = Path.join(workingDirectory, 'deployment.yml');
  if (!FS.existsSync(filepath)) {
    console.log('Deployment file deployment.yml does not exist.');
    process.exit(1);
  }

  global.deploymentConfig = YAML.parse(FS.readFileSync(filepath, 'utf8'));
};
