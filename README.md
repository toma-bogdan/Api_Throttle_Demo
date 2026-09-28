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
├── .github/workflows/ci.yml
├── scripts/
│   ├── demo.js                 # Sends one request past a client's capacity
│   └── startRedis.js           # Starts the server with Redis storage
├── src/
│   ├── server.js               # Express app entrypoint
│   ├── config/
│   │   ├── settings.js         # Runtime config, defaults overridden by the environment
│   │   └── clients.json        # Client rate limit configs
│   ├── service/
│   │   ├── auth.js             # Auth middleware
│   │   ├── barAlgorithm.js     # Fixed window rate limiter
│   │   ├── fooAlgorithm.js     # Token bucket rate limiter
│   │   └── limitResponse.js    # Shared rate-limit headers and 429 body
│   └── storage/
│       ├── selectStore.js      # Storage selector
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
In-memory storage needs no extra services. The process prints which store it is using.

```sh
npm start
```

### Run with Redis
```sh
docker compose up -d
npm run start:redis
```

Counters survive a process restart for as long as that Redis container is running. Stop Redis with `docker compose down`.

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
npm run demo:foo   # client-1 on /foo, capacity 5
npm run demo:bar   # client-3 on /bar, capacity 20
```

### Configuration
`src/config/settings.js` supplies defaults only. The process reads `PORT`, `STORAGE`, and `REDIS_URL` from the environment at startup, so a deployed host can switch store without changing the code or adding a config file. Set the variables in the host (shell, systemd, Docker, or the cloud console) and restart. One process uses one store.

Locally, `npm start` leaves `STORAGE` unset, so the store is memory. `npm run start:redis` sets `STORAGE=redis` and then starts the same server.

```sh
PORT=3001 npm start
REDIS_URL=redis://example:6379 npm run start:redis
```

- `PORT` (default: 3000): Port to run the server
- `STORAGE` (`memory` or `redis`, default: `memory`)
- `REDIS_URL` (default: `redis://localhost:6379`): Used when `STORAGE=redis`


## API Endpoints

### Authentication
All endpoints require an `Authorization: Bearer <clientId>` header. Client ids and their limits are in `src/config/clients.json`.

### `GET /foo`
Token bucket. Each client has a `capacity` and a `fillPerSecond` refill rate. A request is allowed while the bucket still holds at least one token.

### `GET /bar`
Fixed window. Each client can make `capacity` requests during `windowSeconds`. Further requests in that window are rejected.

A rejected request from either endpoint returns `429` and `{ "error": "Rate limit exceeded" }`. An allowed request returns `200` and `{ "success": true }`.
