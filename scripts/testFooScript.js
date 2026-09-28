import clients from '../src/config/clients.json' with { type: 'json' };

const clientId = 'client-1';
const attempts = clients[clientId].capacity + 1;
const url = 'http://localhost:3000/foo';

for (let i = 1; i <= attempts; i++) {
  console.log(`===== Request #${i} =====`);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${clientId}` }
  });
  console.log(`Status: ${res.status}`);
  console.log('Body:  ', await res.json(), '\n');
}
