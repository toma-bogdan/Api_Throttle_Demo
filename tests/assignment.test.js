import { jest } from '@jest/globals';
import httpMocks from 'node-mocks-http';
import auth from '../src/service/auth.js';
import { barAlgorithm } from '../src/service/barAlgorithm.js';
import { fooAlgorithm } from '../src/service/fooAlgorithm.js';

describe('auth middleware', () => {
  it('calls next if Authorization header is present', () => {
    const req = httpMocks.createRequest({ headers: { authorization: 'Bearer client-1' } });
    const res = httpMocks.createResponse();
    const next = jest.fn();
    auth(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 if Authorization header is missing', () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    const next = jest.fn();
    auth(req, res, next);
    expect(res.statusCode).toBe(401);
  });
});

describe('fooAlgorithm', () => {
  it('calls next if there are enough tokens', async () => {
    const req = {
      clientId: 'client-1',
      rateLimitConfig: { fillPerSecond: 5, capacity: 10 }
    };
    const res = httpMocks.createResponse();
    res.set = jest.fn();
    const next = jest.fn();
    await fooAlgorithm(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
  });

  it('returns 429 if not enough tokens', async () => {
    const req = {
      clientId: 'client-1',
      rateLimitConfig: { fillPerSecond: 0, capacity: 0 }
    };
    const res = httpMocks.createResponse();
    res.set = jest.fn();
    const next = jest.fn();
    await fooAlgorithm(req, res, next);
    expect(next).toHaveBeenCalledTimes(0);
    expect(res.statusCode).toBe(429);
    expect(res._getData()).toMatch(/Rate limit exceeded/);
  });
});

describe('barAlgorithm', () => {
  it('calls next if under rate limit', async () => {
    const req = {
      clientId: 'client-1',
      rateLimitConfig: { windowSeconds: 60, capacity: 5 }
    };
    const res = httpMocks.createResponse();
    res.set = jest.fn();
    const next = jest.fn();

    await barAlgorithm(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith('X-RateLimit-Limit', 5);
  });
});
