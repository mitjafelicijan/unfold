const Request = require('sync-request');
const Table = require('cli-table');

module.exports = async (subcommand) => {

  const res = Request('GET', 'https://api.digitalocean.com/v2/customers/my/balance', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${profileConfig.apiKey}`,
    },
  });

  const results = JSON.parse(res.getBody('utf8'));
  const table = new Table();

  table.push(
    { 'Month to date balance': `$${results.month_to_date_balance}` },
    { 'Account balance': `$${results.account_balance}` },
    { 'Month to date usage': `$${results.month_to_date_usage}` },
  );

  console.log(table.toString());

};
