import clients from '../config/clients.json' with { type: 'json' };

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
  req.rateLimitConfig = config;

  next();
}

export default auth;
