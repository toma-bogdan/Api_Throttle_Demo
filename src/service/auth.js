import clients from '../config/clients.json' with { type: 'json' };

export function validateClients(clientList) {
  const ids = Object.keys(clientList);
  if (ids.length === 0) {
    throw new Error('At least one client is required');
  }

  for (const id of ids) {
    const client = clientList[id];
    if (!client?.foo || !client?.bar) {
      throw new Error(`${id} must include foo and bar limits`);
    }
  }
}

validateClients(clients);

function auth(req, res, next) {
  const header = req.header('Authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/);

  if (!match) {
    return res
      .status(401)
      .json({ error: 'Missing or malformed Authorization header' });
  }

  const clientId = match[1];
  const config = clients[clientId];

  if (!config) {
    return res
      .status(403)
      .json({ error: 'Unknown client ID' });
  }

  req.clientId = clientId;
  req.clientConfig = config;

  next();
}

export default auth;
