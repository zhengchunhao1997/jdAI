# Customer Service Data API

This project expects PostgreSQL via `DATABASE_URL`.

Run the schema once on the server database:

```bash
psql "$DATABASE_URL" -f db/customer-service-tables.sql
```

Required environment variables:

```txt
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_SSL=true
CUSTOMER_DATA_API_KEY=replace_with_a_random_api_key
```

Set `DATABASE_SSL=false` only for a private server database that does not use SSL.

`CUSTOMER_DATA_API_KEY` is optional. If configured, every insert request must include:

```http
Authorization: Bearer replace_with_a_random_api_key
```

## Insert APIs

All endpoints accept either a single JSON object:

```json
{ "id": "1", "user_id": "u1" }
```

or a batch payload:

```json
{ "records": [{ "id": "1", "user_id": "u1" }] }
```

Rows are upserted by `id`.

### Customer leads

```http
POST /api/customer-leads
```

Fields match `customer_leads_*.csv`.

Required:

- `id`
- `user_id`

### Conversation events

```http
POST /api/conversation-events
```

Fields match `conversation_events_*.csv`.

Required:

- `id`
- `user_id`

### Knowledge-base miss questions

```http
POST /api/kb-miss-questions
```

Fields match `kb_miss_questions_*.csv`.

Required:

- `id`

## EdgeOne Pages Cloud Functions

The production EdgeOne Pages endpoints are implemented under `cloud-functions/api/*.js` so they can use the Node.js runtime and the `pg` package.

Routes:

- `POST /api/customer-leads`
- `POST /api/conversation-events`
- `POST /api/kb-miss-questions`

For local Next.js development, matching Next API routes also exist under `app/api/*/route.ts`.
