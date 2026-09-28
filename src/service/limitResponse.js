export function setLimitHeaders(res, limit, remaining) {
  res.set('X-RateLimit-Limit', limit);
  res.set('X-RateLimit-Remaining', remaining);
}

export function rateLimitExceeded(res, retryAfter) {
  const response = res.status(429);
  if (retryAfter !== undefined) {
    response.set('Retry-After', String(retryAfter));
  }
  return response.json({ error: 'Rate limit exceeded' });
}
