# Running Tests

From `ProjectSourceCode/`, configure `.env.test` using `.env.test.example`, then run:

```bash
docker compose -p lab10-tests -f docker-compose.test.yaml run --rm --no-deps tests npm ci
docker compose -p lab10-tests -f docker-compose.test.yaml up --abort-on-container-exit --exit-code-from tests
```

Run the second command twice to confirm repeatability. All four tests are passing.

# Registration Route

- **Endpoint:** `POST /register`
- **Input:** Form data containing first name, last name, email, and password (minimum 8 characters).
- **Success:** HTTP 302 redirect to `/login`.
- **Invalid input:** HTTP 400 with `Invalid input`.
- **Database:** Creates one record in `users`, storing username (email), email, first name, last name, and a bcrypt-hashed password.

# Tests and Cleanup

- **Welcome:** Verifies the expected response.
- **Unit:** Rejects registration with a missing password.
- **Positive integration:** Verifies successful registration, saved data, and password hashing.
- **Negative integration:** Verifies invalid registration is rejected without inserting a user.

Tests use a separate test database. Unique test users are removed using `beforeEach` and `afterEach`, allowing repeated runs without manual cleanup.