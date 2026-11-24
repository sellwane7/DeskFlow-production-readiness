# DeskFlow Test Plan (Day 2)

## 1. Endpoint audit

| Endpoint | Access | Tested before sprint? | Unit | Integration |
|---|---|---|---|---|
| POST /api/auth/login | Public | No (Postman only) | - | Yes |
| POST /api/tickets | Employee | No | Yes | Yes |
| GET /api/tickets | Employee/Admin | No | Yes | Yes |
| PUT /api/tickets/:id | Admin | No | Yes | Yes |
| GET /api/health | Public | No | - | Yes |
| GET /api/ready | Public | No | - | Yes |

## 2. Strategy

- **Unit tests** call controllers/middleware directly with mocked `req`/`res` and mocked Mongoose models. They verify one function's logic.
- **Integration tests** use Supertest against the real Express app (routes, middleware, auth, error handler) with Mongoose models mocked, so no database is needed in CI.
- Not covered by automation: real MongoDB behaviour (indexes, schema validation) and the React UI. These stay manual / future work.

## 3. Scenarios

**Ticket creation:** valid payload; missing fields; invalid priority; DB error forwarded.
**Status transitions:** Open, In Progress, Resolved accepted; unknown/missing status rejected; unknown ticket gives 404.
**RBAC:** no token (401); bad/expired token (401); Employee cannot update (403); Admin cannot create (403); employees only see their own tickets; admins see all.
**Auth:** missing credentials; unknown user; wrong password; success returns JWT and no password.
**Platform:** health 200; ready 503 without DB; JSON 404.

## 4. Tooling and targets
Jest + Supertest, `jest --coverage`. Thresholds: 80% statements/lines/functions, 70% branches (enforced in `jest.config.js`).
