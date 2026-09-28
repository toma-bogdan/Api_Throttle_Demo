import clients from '../src/config/clients.json' with { type: 'json' };
import config from '../src/config/settings.js';

const [endpoint, clientId] = process.argv.slice(2);
const client = clients[clientId];

if ((endpoint !== 'foo' && endpoint !== 'bar') || !client) {
  console.error('Usage: node scripts/demo.js <foo|bar> <client-id>');
  process.exit(1);
}

const url = `http://localhost:${config.port}/${endpoint}`;
const attempts = client.capacity + 1;

for (let i = 1; i <= attempts; i++) {
  console.log(`===== Request #${i} =====`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${clientId}` },
  });
  console.log(`Status: ${res.status}`);
  console.log('Body:  ', await res.json(), '\n');
}
