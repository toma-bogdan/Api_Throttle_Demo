# ShowPadAssessment

A Node.js Express API implementing rate limiting algorithms (Fixed Window and Token Bucket)
with 2 storage options (in-memory or Redis) that are set through environment variables.
In-memory is managed through a hashmap, each client will have a different entry for each algorithm.

## Project Structure
```
ShowPadAssessment/
├── package.json
├── jest.config.mjs
├── eslint.config.js
├── docker-compose.yml
├── .env.example
├── .github/workflows/ci.yml
├── src/
│   ├── index.js                # Express app entrypoint
│   ├── config/
│   │   └── clients.json        # Client rate limit configs
│   ├── routes/
│   │   ├── foo.js              # /foo endpoint
│   │   └── bar.js              # /bar endpoint
│   ├── service/
│   │   ├── auth.js             # Auth middleware
│   │   ├── barAlgorithm.js     # Fixed window rate limiter
│   │   └── fooAlgorithm.js     # Token bucket rate limiter
│   └── storage/
│       ├── index.js            # Storage selector
│       ├── localMemory.js      # In-memory store
│       └── redisStore.js       # Redis store
├── tests/
│   └── assignment.test.js      # Unit tests
```

## Getting Started

### Prerequisites
- Node.js 22+ plus npm
- Docker, only when using Redis storage

### Install Dependencies
```sh
npm install
```

### Run the Server
`npm start` uses in-memory counters. No `.env` file is required. Copy `.env.example` to `.env` only when you want to override `PORT` or `STORAGE`.

```sh
npm start
```

### Run with Redis
```sh
docker compose up -d
```

In `.env`, set `STORAGE=redis` and `REDIS_URL=redis://localhost:6379`, then start the server again. Counters survive a process restart for as long as that Redis container is running. Stop it with `docker compose down`.

### Run Tests
```sh
npm test
```

### Lint
```sh
npm run lint
```

### Demo a 429
With the server running, each script sends one request past that client's `capacity`. The last response is 429.

```sh
npm run demo:foo   # client-1, capacity 5
npm run demo:bar   # client-3, capacity 20
```

### Environment Variables
- `PORT` (default: 3000): Port to run the server
- `STORAGE` (default: `memory`): Set to `redis` to use Redis
- `REDIS_URL` (default: `redis://localhost:6379`): Redis connection string when `STORAGE=redis`

See `.env.example`. `.env` is local and is not committed.


## API Endpoints

### Authentication
All endpoints require an `Authorization: Bearer <clientId>` header. Valid client IDs and their rate limits are defined in `src/config/clients.json`.

There are 4 clients available with different limit rates and works for both endpoints:
{
  "client-1": { "windowSeconds": 10, "capacity": 5, "fillPerSecond": 0.1},
  "client-2": { "windowSeconds": 20, "capacity": 10, "fillPerSecond": 1},
  "client-3": { "windowSeconds": 60, "capacity": 20, "fillPerSecond": 0.5},
  "client-4": { "windowSeconds": 10, "capacity": 3, "fillPerSecond": 1.1}
}

### `GET /foo`
- **Rate Limiting:** Token Bucket
  Clients have a token capacity and a fillPerSecondRate rate which fills the token bucket per second.
  If a client have no tokens left, the request is dropped. 
  This approach prevents sudden traffic spikes from an user.

### `GET /bar`
- **Rate Limiting:** Fixed Window
  Clients have a fixed window period where they can make "capacity" amount of requests.
  If a client exceeded that limit the request is dropped until the next window period.

### `Remote Testing`
 The solution is uploaded in a AWS EC2 and can be tested by calling for example:
 - Windows:
  curl.exe -i `  -H "Authorization: Bearer client-1" `  http://3.122.250.54/bar 
  curl.exe -i `  -H "Authorization: Bearer client-2" `  http://3.122.250.54/foo

- Linux:
 curl -i -H "Authorization: Bearer client-1" http://3.122.250.54/bar
 curl -i -H "Authorization: Bearer client-1" http://3.122.250.54/foo

## Customization
- Add or modify client configs in `src/config/clients.json`.
