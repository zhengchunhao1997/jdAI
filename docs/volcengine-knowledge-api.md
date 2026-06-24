# 火山知识库接入接口

## 目标

即答后台通过自己的后端代理火山知识库 API，避免把火山 API Key 暴露给浏览器或 Coze。

当前已预留这些接口：

```txt
GET  /api/knowledge/status
POST /api/knowledge/search
POST /api/knowledge/docs
POST /api/knowledge/points
POST /api/knowledge/points-add
POST /api/knowledge/points-update
POST /api/knowledge/points-delete
```

服务器地址：

```txt
http://1.92.99.77:39080
```

统一鉴权：

```http
Authorization: Bearer <JIDAH_API_KEY>
Content-Type: application/json
```

## 服务器环境变量

火山密钥只放服务器 `.env`，不要提交到 GitHub。

```txt
VOLC_KNOWLEDGE_API_KEY=火山知识库 API Key
VOLC_KNOWLEDGE_BASE_URL=https://api-knowledgebase.mlp.cn-beijing.volces.com
VOLC_KNOWLEDGE_RESOURCE_ID=火山知识库资源 ID
VOLC_KNOWLEDGE_COLLECTION_NAME=知识库名称
VOLC_KNOWLEDGE_PROJECT=default
VOLC_KNOWLEDGE_DOC_ID=默认写入文档 ID
```

`VOLC_KNOWLEDGE_RESOURCE_ID`、`VOLC_KNOWLEDGE_COLLECTION_NAME`、`VOLC_KNOWLEDGE_DOC_ID` 需要从火山控制台或 API 查询确认。

## 状态检查

```bash
curl 'http://1.92.99.77:39080/api/knowledge/status' \
  -H 'Authorization: Bearer <JIDAH_API_KEY>'
```

## 检索知识库

```bash
curl -X POST 'http://1.92.99.77:39080/api/knowledge/search' \
  -H 'Authorization: Bearer <JIDAH_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "query": "有副作用吗？",
    "limit": 3
  }'
```

如果没有配置默认资源，也可以显式传：

```json
{
  "resource_id": "火山知识库资源ID",
  "collection_name": "知识库名称",
  "project": "default",
  "query": "有副作用吗？",
  "limit": 3
}
```

## 查询文档

```bash
curl -X POST 'http://1.92.99.77:39080/api/knowledge/docs' \
  -H 'Authorization: Bearer <JIDAH_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "offset": 0,
    "limit": 50
  }'
```

## 查询切片

```bash
curl -X POST 'http://1.92.99.77:39080/api/knowledge/points' \
  -H 'Authorization: Bearer <JIDAH_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "offset": 0,
    "limit": 50
  }'
```

## 新增切片

需要 `doc_id`。如果服务器配置了 `VOLC_KNOWLEDGE_DOC_ID`，请求体可以不传。

```bash
curl -X POST 'http://1.92.99.77:39080/api/knowledge/points-add' \
  -H 'Authorization: Bearer <JIDAH_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "doc_id": "火山文档ID",
    "chunk_type": "text",
    "chunk_title": "副作用说明",
    "content": "这里填写客户确认过的标准话术原文"
  }'
```

## 修改切片

```bash
curl -X POST 'http://1.92.99.77:39080/api/knowledge/points-update' \
  -H 'Authorization: Bearer <JIDAH_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "point_id": "火山切片ID",
    "chunk_title": "副作用说明",
    "content": "修改后的标准话术"
  }'
```

## 删除切片

```bash
curl -X POST 'http://1.92.99.77:39080/api/knowledge/points-delete' \
  -H 'Authorization: Bearer <JIDAH_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "point_id": "火山切片ID"
  }'
```

## 第一版建议

先完成这条链路：

```txt
后台/Coze -> /api/knowledge/search -> 返回最相关知识库片段 -> 直接作为客服回复 -> /api/v2/customer-service/events 写聊天记录
```

如果要在即答后台维护知识库，再继续做：

```txt
新增标准话术 -> /api/knowledge/points-add -> 同步到火山知识库
```
