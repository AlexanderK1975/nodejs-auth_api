![Version](https://img.shields.io/badge/Version-1.0.0-blue)

# Auth API

The service is implemented with Node.js and Express.js to register and authenticate users.

### Quick start

##### 1. Install dependencies

```
    npm install
```

##### 2. Run Redis (default at redis://127.0.0.1:6379)

It can be set `REDIS_URL` environment varariable to change dfeault URL.

##### Run **Redis** on Windows:

- Install Docker Desktop from https://www.docker.com/products/docker-desktop
- Run Redis container
```
    docker run --name redis -p 6379:6379 -d redis
```

##### 3. Setup service configuearion

Create `.env` file with the service configuration like the following:
```
    PORT=3000
    REDIS_URL='redis://127.0.0.1:6379'
    RATE_LIMIT_PER_MIN = 30
    LOGS_LABEL='Auth API'
    LOGS_LEVEL='info'
    ERROR_LOGS='logs/error.log'
    INFO_LOGS='logs/app.log'
```


##### 4. Build and start the service
```
    npm run build
    npm run start
```

The following script can be used for development purposes to re-build the service automatically in case of some changes.
```
    npm run dev
```

> Service listens on `PORT` (default 3000).

> Rate limit for the same IP address per minite is defuned by `RATE_LIMIT_PER_MIN` (default 30).

### Endpoints

- POST /register  - register a username/password
    - Request JSON: `{ username: "alexander", password: "Secret!Pass123" }`
    - Responses:
        - `200 OK: { success: true, user: { id: <id>, username: <username>, created_at: <timestamp> } }`
        - `400 BadRequest: { success: false, error: <validation error message> }`
        - `409 Conflict: { success: false, error: <conflict error message> }`
        - `500 Internal Server error: { success: false, error: <server error message> }`

- POST /login - authenticate
    - Request JSON: `{ username: "alexander", password: "Secret!Pass123" }`
    - Responses:
        - `200 OK: { success: true, user: { id: <id>, username: <username> } }`
        - `401 Unauthorized: { success: false, error: <authentication error message> }`
        - `400 BadRequest: { success: false, error: <validation error message> }`
        - `500 Internal Server error: { success: false, error: <server error message> }`

- GET /health - check the service availability
    - Responses:
        - `200 OK: { status: 'ok' }`

### Example CURLs
#### Register
```
curl -X POST http://localhost:3000/register -H 'Content-Type: application/json'
-d '{ "username":"alexander", "password":"Secret!Pass123" }'
```
#### Login
```
curl -X POST http://localhost:3000/login -H 'Content-Type: application/json'
-d '{ "username":"alexander", "password":"Secret!Pass123" }'
```
#### Health
```
curl -X GET http://localhost:3000/health -H 'Content-Type: application/json'
```

### Security

The implementation includes basic security best-practices:
- Passwords hashed with Argon2id (memory and CPU hardening provided by argon2 defaults).
- Input validation performs with Joi and explicit password complexity rules (min 12 characters, upper/lower/digit/symbol).
- Helmet middleware is used for basic HTTP header hardening.
- Rate limiting on auth endpoints to slow automated guessing.
- Only password hashes are stored, not plain-text passwords.
- Username must be between 8 and 64 characters.

### Areas to improve / annotate for future development

- **Atomic user creation**
    - Current code checks username existence before user is added to database, which may be vulnurable to two concurrent processes trying to add the same username at the same time.
    - Will need to use a Redis Lua script or SET with NX on a user lock key to guarantee atomic creation.
    - For high-scale systems, consider a unique constraint through a separate SETNX key or a Redis transaction (WATCH/MULTI)/Lua to ensure atomicity.

- **Argon2 tuning**
    - Tune argon2 parameters (memoryCost, timeCost, parallelism) to match the deployment's CPU/RAM.
    - Use env vars for tuning argor2 parameters as defaults.

- **Account take-over protections**
    - Add exponential backoff on failed attempts, IP-based rate limits, or account lockouts (with secure admin unlock flows).

- **Transport security**
    - Current code assumes TLS is terminated (for internal services).
    - Need to ensure the service is running with HTTPS/TLS.

- **Token issuance**
    - For service-to-service authentication, ideally we want to issue short-lived JWTs or signed tokens.

- **Password validation**
    - Reject common passwords and passwords similar to username (depends on a business requirements).

- **Performance improvement**
    - Current code uses Express.js. In case of a requirement to improve performance it can be replaced with the Fastify framework.

- **TypeScript implementation**
    - Current code is implemented with JavaScript. Depends on a roadmap it can be converted to TypeScript based implementation.

- **Containerization**
    - Current service does not use any containerization. There can be added a Docker file to support containerization (depends on a business roadmap and needs).

- **Cloud-native**
    - Current service is not cloud-native. It can be extended to use cloud services if needed (depends on a business roadmap and needs).

- **Testing**
    - Implement unit tests to be sure in code quality and avoid future regressions.

- **DevOps**
    - Add CI/CD to automate build, testing and deployment.
