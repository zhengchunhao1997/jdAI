# Deployment

This project is deployed from the `main` branch.

Primary deployment target:

- Tencent Cloud EdgeOne Pages project: `jidah-ai`
- Source repository: `https://github.com/zhengchunhao1997/jdAI`

Required environment variables:

- `COZE_API_TOKEN`
- `COZE_BOT_ID`
- `COZE_WORKFLOW_ID`
- `COZE_WORKFLOW_INPUT_KEY` (defaults to `USER_INPUT`)
- `COZE_CONVERSATION_NAME` (defaults to `Default`)
- `DATABASE_URL`
- `DATABASE_SSL` (optional, defaults to SSL enabled)
- `CUSTOMER_DATA_API_KEY` (optional; if set, data insert APIs require `Authorization: Bearer <key>`)
