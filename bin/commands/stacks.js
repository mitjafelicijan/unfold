const Request = require('sync-request');
const Table = require('cli-table');

module.exports = async (subcommand) => {

  const res = Request('GET', 'https://api.digitalocean.com/v2/droplets', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });

  const results = JSON.parse(res.getBody('utf8'));

  // display in table view
  const tableHeadings = subcommand == 'wide'
    ? ['ID', 'Name', 'Memory', 'vCPU', 'Region', 'Status', 'Locked', 'Tag', 'Public IP', 'Created at']
    : ['ID', 'Name', 'Status', 'Tag', 'Public IP', 'Created at']

  const table = new Table({
    head: tableHeadings
  });

  for (const droplet of results.droplets) {
    let publicIp = null;
    for (const ipv4 of droplet.networks.v4) {
      if (ipv4.type == 'public') {
        publicIp = ipv4.ip_address;
      }
    }

    let row = subcommand == 'wide'
      ? [droplet.id, droplet.name, droplet.memory, droplet.vcpus, droplet.region.slug, droplet.status, droplet.locked, droplet.tags.join(), publicIp, droplet.created_at]
      : [droplet.id, droplet.name, droplet.status, droplet.tags.join(), publicIp, droplet.created_at]

    table.push(row);

  }
  console.log(table.toString());

};
