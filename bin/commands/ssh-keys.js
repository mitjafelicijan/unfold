const Request = require('sync-request');
const Table = require('cli-table');

module.exports = async (subcommand) => {

  const res = Request('GET', 'https://api.digitalocean.com/v2/account/keys', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });

  const results = JSON.parse(res.getBody('utf8'));

  // display in table view
  const table = new Table({
    head: ['ID', 'Name', 'Fingerprint']
  });

  for (const key of results.ssh_keys) {
    table.push(
      [key.id, key.name, key.fingerprint]
    );
  }
  console.log(table.toString());

};
