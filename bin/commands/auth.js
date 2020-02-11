const FS = require('fs');
const Path = require('path');
const YAML = require('yaml');
const ReadlineSync = require('readline-sync');
const Colors = require('colors');

module.exports = async (subcommand) => {

  const filepath = Path.join(homeDirectory, '/.unfold/profile.yml');

  // prompt user for acceptance
  console.log('DigitalOcean API Key:')
  const apiKey = ReadlineSync.prompt();
  if (!apiKey) {
    console.log('Cannot be empty!'.red);
    process.exit(1);
  }
  console.log();

  const yamlProfileString = YAML.stringify({
    apiKey: apiKey,
  });

  try {
    if (!FS.existsSync(Path.join(homeDirectory, '/.unfold'))) {
      FS.mkdirSync(Path.join(homeDirectory, '/.unfold'));
    }
    FS.writeFileSync(filepath, yamlProfileString);

  } catch (error) {
    console.log(error);
  }

};
