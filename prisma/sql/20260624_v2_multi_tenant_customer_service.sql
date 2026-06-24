-- CreateTable
CREATE TABLE "v2_tenants" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "settingsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_tenant_users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL DEFAULT 'viewer',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_tenant_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_channels" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "channelName" TEXT NOT NULL,
    "externalAppId" TEXT,
    "configJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_customers" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "primaryChannelId" TEXT,
    "externalUserId" TEXT,
    "nickname" TEXT,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "wechat" TEXT,
    "email" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_customer_identities" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "channelType" TEXT NOT NULL,
    "externalUserId" TEXT NOT NULL,
    "externalOpenId" TEXT,
    "externalUnionId" TEXT,
    "nickname" TEXT,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_customer_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_customer_profiles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "profileJson" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profileScore" INTEGER NOT NULL DEFAULT 0,
    "lastExtractedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_conversations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "externalConversationId" TEXT,
    "source" TEXT,
    "sourceDetail" TEXT,
    "statusCode" TEXT NOT NULL DEFAULT 'AI_SERVING',
    "intentLevelCode" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "stageCode" TEXT NOT NULL DEFAULT 'NEW',
    "summary" TEXT,
    "lastMessage" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "assignedStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "v2_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_messages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'text',
    "messageSeq" INTEGER NOT NULL,
    "externalMessageId" TEXT,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_workflows" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "channelId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'coze',
    "purpose" TEXT NOT NULL DEFAULT 'chat',
    "workflowId" TEXT NOT NULL,
    "workflowVersion" TEXT,
    "modelName" TEXT,
    "promptVersion" TEXT,
    "personaVersion" TEXT,
    "configJson" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_ai_runs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userMessageId" TEXT,
    "aiMessageId" TEXT,
    "workflowConfigId" TEXT,
    "workflowProvider" TEXT NOT NULL DEFAULT 'coze',
    "workflowId" TEXT,
    "workflowVersion" TEXT,
    "modelName" TEXT,
    "promptVersion" TEXT,
    "personaVersion" TEXT,
    "inputJson" JSONB,
    "rawOutput" TEXT,
    "finalAnswer" TEXT,
    "latencyMs" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_ai_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_message_knowledge_refs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "aiRunId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "externalKbId" TEXT,
    "externalDocId" TEXT,
    "knowledgeTitle" TEXT,
    "knowledgeContentSnapshot" TEXT,
    "matchedText" TEXT,
    "similarityScore" DOUBLE PRECISION,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_message_knowledge_refs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_leads" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "intentLevelCode" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "stageCode" TEXT NOT NULL DEFAULT 'NEW',
    "statusCode" TEXT NOT NULL DEFAULT 'OPEN',
    "score" INTEGER NOT NULL DEFAULT 0,
    "mainNeed" TEXT,
    "mainConcern" TEXT,
    "recommendedSolution" TEXT,
    "nextAction" TEXT,
    "ownerStaffId" TEXT,
    "lastFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_lead_events" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "conversationId" TEXT,
    "eventType" TEXT NOT NULL,
    "fromValue" TEXT,
    "toValue" TEXT,
    "reason" TEXT,
    "operatorType" TEXT NOT NULL DEFAULT 'SYSTEM',
    "operatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_lead_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_follow_ups" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "conversationId" TEXT,
    "staffId" TEXT,
    "followUpType" TEXT NOT NULL,
    "content" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "resultCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_deals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "conversationId" TEXT,
    "amount" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "dealStatusCode" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "source" TEXT NOT NULL DEFAULT 'HUMAN',
    "externalOrderId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_dictionaries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "dictType" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "metaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_dictionaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_kb_miss_questions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "customerId" TEXT,
    "question" TEXT NOT NULL,
    "aiAnswer" TEXT,
    "missTypeCode" TEXT NOT NULL DEFAULT 'NO_KB',
    "missReason" TEXT,
    "suggestedAnswer" TEXT,
    "statusCode" TEXT NOT NULL DEFAULT 'PENDING',
    "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_kb_miss_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_answer_quality_checks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "messageId" TEXT,
    "aiRunId" TEXT,
    "fidelityScore" INTEGER,
    "toneScore" INTEGER,
    "helpfulnessScore" INTEGER,
    "salesGuidanceScore" INTEGER,
    "riskLevelCode" TEXT NOT NULL DEFAULT 'NONE',
    "issuesJson" JSONB,
    "suggestion" TEXT,
    "reviewStatusCode" TEXT NOT NULL DEFAULT 'AUTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_answer_quality_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_audit_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "detailJson" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "v2_tenants_code_key" ON "v2_tenants"("code");

-- CreateIndex
CREATE INDEX "v2_tenants_status_idx" ON "v2_tenants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "v2_users_username_key" ON "v2_users"("username");

-- CreateIndex
CREATE INDEX "v2_users_status_idx" ON "v2_users"("status");

-- CreateIndex
CREATE INDEX "v2_tenant_users_userId_idx" ON "v2_tenant_users"("userId");

-- CreateIndex
CREATE INDEX "v2_tenant_users_tenantId_roleCode_idx" ON "v2_tenant_users"("tenantId", "roleCode");

-- CreateIndex
CREATE UNIQUE INDEX "v2_tenant_users_tenantId_userId_key" ON "v2_tenant_users"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "v2_user_sessions_tokenHash_key" ON "v2_user_sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "v2_user_sessions_userId_expiresAt_idx" ON "v2_user_sessions"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "v2_user_sessions_expiresAt_idx" ON "v2_user_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "v2_channels_tenantId_channelType_idx" ON "v2_channels"("tenantId", "channelType");

-- CreateIndex
CREATE INDEX "v2_channels_tenantId_status_idx" ON "v2_channels"("tenantId", "status");

-- CreateIndex
CREATE INDEX "v2_customers_tenantId_lastSeenAt_idx" ON "v2_customers"("tenantId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "v2_customers_tenantId_status_idx" ON "v2_customers"("tenantId", "status");

-- CreateIndex
CREATE INDEX "v2_customers_tenantId_externalUserId_idx" ON "v2_customers"("tenantId", "externalUserId");

-- CreateIndex
CREATE INDEX "v2_customer_identities_customerId_idx" ON "v2_customer_identities"("customerId");

-- CreateIndex
CREATE INDEX "v2_customer_identities_tenantId_externalUnionId_idx" ON "v2_customer_identities"("tenantId", "externalUnionId");

-- CreateIndex
CREATE UNIQUE INDEX "v2_customer_identities_tenantId_channelId_externalUserId_key" ON "v2_customer_identities"("tenantId", "channelId", "externalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "v2_customer_profiles_customerId_key" ON "v2_customer_profiles"("customerId");

-- CreateIndex
CREATE INDEX "v2_customer_profiles_tenantId_profileScore_idx" ON "v2_customer_profiles"("tenantId", "profileScore");

-- CreateIndex
CREATE INDEX "v2_conversations_tenantId_updatedAt_idx" ON "v2_conversations"("tenantId", "updatedAt");

-- CreateIndex
CREATE INDEX "v2_conversations_tenantId_customerId_updatedAt_idx" ON "v2_conversations"("tenantId", "customerId", "updatedAt");

-- CreateIndex
CREATE INDEX "v2_conversations_tenantId_statusCode_idx" ON "v2_conversations"("tenantId", "statusCode");

-- CreateIndex
CREATE INDEX "v2_conversations_tenantId_intentLevelCode_idx" ON "v2_conversations"("tenantId", "intentLevelCode");

-- CreateIndex
CREATE INDEX "v2_conversations_tenantId_stageCode_idx" ON "v2_conversations"("tenantId", "stageCode");

-- CreateIndex
CREATE INDEX "v2_conversations_assignedStaffId_idx" ON "v2_conversations"("assignedStaffId");

-- CreateIndex
CREATE INDEX "v2_messages_tenantId_conversationId_createdAt_idx" ON "v2_messages"("tenantId", "conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "v2_messages_tenantId_customerId_createdAt_idx" ON "v2_messages"("tenantId", "customerId", "createdAt");

-- CreateIndex
CREATE INDEX "v2_messages_tenantId_role_idx" ON "v2_messages"("tenantId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "v2_messages_conversationId_messageSeq_key" ON "v2_messages"("conversationId", "messageSeq");

-- CreateIndex
CREATE INDEX "v2_workflows_tenantId_provider_purpose_idx" ON "v2_workflows"("tenantId", "provider", "purpose");

-- CreateIndex
CREATE INDEX "v2_workflows_tenantId_status_idx" ON "v2_workflows"("tenantId", "status");

-- CreateIndex
CREATE INDEX "v2_ai_runs_tenantId_conversationId_createdAt_idx" ON "v2_ai_runs"("tenantId", "conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "v2_ai_runs_tenantId_workflowProvider_workflowId_idx" ON "v2_ai_runs"("tenantId", "workflowProvider", "workflowId");

-- CreateIndex
CREATE INDEX "v2_ai_runs_tenantId_status_idx" ON "v2_ai_runs"("tenantId", "status");

-- CreateIndex
CREATE INDEX "v2_message_knowledge_refs_tenantId_aiRunId_idx" ON "v2_message_knowledge_refs"("tenantId", "aiRunId");

-- CreateIndex
CREATE INDEX "v2_message_knowledge_refs_tenantId_messageId_idx" ON "v2_message_knowledge_refs"("tenantId", "messageId");

-- CreateIndex
CREATE INDEX "v2_message_knowledge_refs_tenantId_externalKbId_idx" ON "v2_message_knowledge_refs"("tenantId", "externalKbId");

-- CreateIndex
CREATE INDEX "v2_leads_tenantId_intentLevelCode_idx" ON "v2_leads"("tenantId", "intentLevelCode");

-- CreateIndex
CREATE INDEX "v2_leads_tenantId_stageCode_idx" ON "v2_leads"("tenantId", "stageCode");

-- CreateIndex
CREATE INDEX "v2_leads_tenantId_statusCode_idx" ON "v2_leads"("tenantId", "statusCode");

-- CreateIndex
CREATE INDEX "v2_leads_tenantId_ownerStaffId_idx" ON "v2_leads"("tenantId", "ownerStaffId");

-- CreateIndex
CREATE INDEX "v2_leads_tenantId_updatedAt_idx" ON "v2_leads"("tenantId", "updatedAt");

-- CreateIndex
CREATE INDEX "v2_lead_events_tenantId_leadId_createdAt_idx" ON "v2_lead_events"("tenantId", "leadId", "createdAt");

-- CreateIndex
CREATE INDEX "v2_lead_events_tenantId_eventType_idx" ON "v2_lead_events"("tenantId", "eventType");

-- CreateIndex
CREATE INDEX "v2_follow_ups_tenantId_leadId_createdAt_idx" ON "v2_follow_ups"("tenantId", "leadId", "createdAt");

-- CreateIndex
CREATE INDEX "v2_follow_ups_tenantId_staffId_idx" ON "v2_follow_ups"("tenantId", "staffId");

-- CreateIndex
CREATE INDEX "v2_follow_ups_tenantId_nextFollowUpAt_idx" ON "v2_follow_ups"("tenantId", "nextFollowUpAt");

-- CreateIndex
CREATE INDEX "v2_deals_tenantId_dealStatusCode_idx" ON "v2_deals"("tenantId", "dealStatusCode");

-- CreateIndex
CREATE INDEX "v2_deals_tenantId_externalOrderId_idx" ON "v2_deals"("tenantId", "externalOrderId");

-- CreateIndex
CREATE INDEX "v2_deals_tenantId_paidAt_idx" ON "v2_deals"("tenantId", "paidAt");

-- CreateIndex
CREATE INDEX "v2_dictionaries_dictType_enabled_idx" ON "v2_dictionaries"("dictType", "enabled");

-- CreateIndex
CREATE INDEX "v2_dictionaries_tenantId_dictType_sortOrder_idx" ON "v2_dictionaries"("tenantId", "dictType", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "v2_dictionaries_tenantId_dictType_code_key" ON "v2_dictionaries"("tenantId", "dictType", "code");

-- CreateIndex
CREATE INDEX "v2_kb_miss_questions_tenantId_statusCode_idx" ON "v2_kb_miss_questions"("tenantId", "statusCode");

-- CreateIndex
CREATE INDEX "v2_kb_miss_questions_tenantId_missTypeCode_idx" ON "v2_kb_miss_questions"("tenantId", "missTypeCode");

-- CreateIndex
CREATE INDEX "v2_kb_miss_questions_tenantId_lastSeenAt_idx" ON "v2_kb_miss_questions"("tenantId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "v2_answer_quality_checks_tenantId_riskLevelCode_idx" ON "v2_answer_quality_checks"("tenantId", "riskLevelCode");

-- CreateIndex
CREATE INDEX "v2_answer_quality_checks_tenantId_reviewStatusCode_idx" ON "v2_answer_quality_checks"("tenantId", "reviewStatusCode");

-- CreateIndex
CREATE INDEX "v2_answer_quality_checks_tenantId_conversationId_createdAt_idx" ON "v2_answer_quality_checks"("tenantId", "conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "v2_audit_logs_tenantId_createdAt_idx" ON "v2_audit_logs"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "v2_audit_logs_userId_createdAt_idx" ON "v2_audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "v2_audit_logs_action_createdAt_idx" ON "v2_audit_logs"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "v2_tenant_users" ADD CONSTRAINT "v2_tenant_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_tenant_users" ADD CONSTRAINT "v2_tenant_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "v2_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_user_sessions" ADD CONSTRAINT "v2_user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "v2_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_channels" ADD CONSTRAINT "v2_channels_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_customers" ADD CONSTRAINT "v2_customers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_customers" ADD CONSTRAINT "v2_customers_primaryChannelId_fkey" FOREIGN KEY ("primaryChannelId") REFERENCES "v2_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_customer_identities" ADD CONSTRAINT "v2_customer_identities_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "v2_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_customer_identities" ADD CONSTRAINT "v2_customer_identities_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "v2_channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_customer_profiles" ADD CONSTRAINT "v2_customer_profiles_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "v2_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_conversations" ADD CONSTRAINT "v2_conversations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_conversations" ADD CONSTRAINT "v2_conversations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "v2_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_conversations" ADD CONSTRAINT "v2_conversations_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "v2_channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_conversations" ADD CONSTRAINT "v2_conversations_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "v2_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_messages" ADD CONSTRAINT "v2_messages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_messages" ADD CONSTRAINT "v2_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "v2_conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_messages" ADD CONSTRAINT "v2_messages_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "v2_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_workflows" ADD CONSTRAINT "v2_workflows_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_workflows" ADD CONSTRAINT "v2_workflows_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "v2_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_ai_runs" ADD CONSTRAINT "v2_ai_runs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_ai_runs" ADD CONSTRAINT "v2_ai_runs_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "v2_conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_ai_runs" ADD CONSTRAINT "v2_ai_runs_userMessageId_fkey" FOREIGN KEY ("userMessageId") REFERENCES "v2_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_ai_runs" ADD CONSTRAINT "v2_ai_runs_aiMessageId_fkey" FOREIGN KEY ("aiMessageId") REFERENCES "v2_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_ai_runs" ADD CONSTRAINT "v2_ai_runs_workflowConfigId_fkey" FOREIGN KEY ("workflowConfigId") REFERENCES "v2_workflows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_message_knowledge_refs" ADD CONSTRAINT "v2_message_knowledge_refs_aiRunId_fkey" FOREIGN KEY ("aiRunId") REFERENCES "v2_ai_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_message_knowledge_refs" ADD CONSTRAINT "v2_message_knowledge_refs_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "v2_messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_leads" ADD CONSTRAINT "v2_leads_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_leads" ADD CONSTRAINT "v2_leads_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "v2_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_leads" ADD CONSTRAINT "v2_leads_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "v2_conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_leads" ADD CONSTRAINT "v2_leads_ownerStaffId_fkey" FOREIGN KEY ("ownerStaffId") REFERENCES "v2_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_lead_events" ADD CONSTRAINT "v2_lead_events_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_lead_events" ADD CONSTRAINT "v2_lead_events_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "v2_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_lead_events" ADD CONSTRAINT "v2_lead_events_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "v2_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_follow_ups" ADD CONSTRAINT "v2_follow_ups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_follow_ups" ADD CONSTRAINT "v2_follow_ups_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "v2_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_follow_ups" ADD CONSTRAINT "v2_follow_ups_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "v2_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_follow_ups" ADD CONSTRAINT "v2_follow_ups_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "v2_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_follow_ups" ADD CONSTRAINT "v2_follow_ups_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "v2_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_deals" ADD CONSTRAINT "v2_deals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_deals" ADD CONSTRAINT "v2_deals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "v2_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_deals" ADD CONSTRAINT "v2_deals_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "v2_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_deals" ADD CONSTRAINT "v2_deals_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "v2_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_dictionaries" ADD CONSTRAINT "v2_dictionaries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_kb_miss_questions" ADD CONSTRAINT "v2_kb_miss_questions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_kb_miss_questions" ADD CONSTRAINT "v2_kb_miss_questions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "v2_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_kb_miss_questions" ADD CONSTRAINT "v2_kb_miss_questions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "v2_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_kb_miss_questions" ADD CONSTRAINT "v2_kb_miss_questions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "v2_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_answer_quality_checks" ADD CONSTRAINT "v2_answer_quality_checks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_answer_quality_checks" ADD CONSTRAINT "v2_answer_quality_checks_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "v2_conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_answer_quality_checks" ADD CONSTRAINT "v2_answer_quality_checks_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "v2_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_answer_quality_checks" ADD CONSTRAINT "v2_answer_quality_checks_aiRunId_fkey" FOREIGN KEY ("aiRunId") REFERENCES "v2_ai_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_audit_logs" ADD CONSTRAINT "v2_audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "v2_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_audit_logs" ADD CONSTRAINT "v2_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "v2_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Table and column comments
comment on table "v2_tenants" is 'V2租户表：平台上的一个客户项目或商户，是所有业务数据隔离的根节点';
comment on column "v2_tenants"."code" is '租户唯一编码，接口写入时可用作稳定业务标识';
comment on column "v2_tenants"."name" is '租户名称，例如客户公司、品牌或项目名称';
comment on column "v2_tenants"."industry" is '租户所属行业，用于行业模板和默认字典';
comment on column "v2_tenants"."status" is '租户状态，例如ACTIVE、DISABLED';
comment on column "v2_tenants"."settingsJson" is '租户级扩展配置，保存非固定结构设置';

comment on table "v2_users" is 'V2后台用户表：平台管理员、租户管理员、客服、销售、只读账号统一存储';
comment on column "v2_users"."username" is '登录账号，平台内唯一';
comment on column "v2_users"."passwordHash" is '密码哈希，不保存明文密码';
comment on column "v2_users"."displayName" is '后台展示姓名';
comment on column "v2_users"."status" is '账号状态，例如ACTIVE、DISABLED';
comment on column "v2_users"."isPlatformAdmin" is '是否平台管理员，平台管理员可管理全部租户';
comment on column "v2_users"."lastLoginAt" is '最近登录时间';

comment on table "v2_tenant_users" is 'V2租户用户关系表：把后台账号分配到租户，并赋予租户内角色';
comment on column "v2_tenant_users"."tenantId" is '所属租户ID';
comment on column "v2_tenant_users"."userId" is '后台用户ID';
comment on column "v2_tenant_users"."roleCode" is '租户内角色代码，例如tenant_admin、staff、viewer';
comment on column "v2_tenant_users"."status" is '成员关系状态，例如ACTIVE、DISABLED';

comment on table "v2_user_sessions" is 'V2登录会话表：保存后台登录态的哈希令牌和过期时间';
comment on column "v2_user_sessions"."userId" is '登录用户ID';
comment on column "v2_user_sessions"."tokenHash" is '登录令牌哈希值';
comment on column "v2_user_sessions"."expiresAt" is '会话过期时间';
comment on column "v2_user_sessions"."revokedAt" is '主动退出或强制失效时间';

comment on table "v2_channels" is 'V2渠道表：记录网页、公众号、企微、抖音、小红书、飞书、钉钉、APP等渠道配置';
comment on column "v2_channels"."tenantId" is '所属租户ID';
comment on column "v2_channels"."channelType" is '渠道类型代码，例如website、wechat_official、douyin、xiaohongshu';
comment on column "v2_channels"."channelName" is '渠道展示名称';
comment on column "v2_channels"."externalAppId" is '渠道侧应用ID或账号ID';
comment on column "v2_channels"."configJson" is '渠道配置JSON，敏感字段应脱敏或加密';
comment on column "v2_channels"."status" is '渠道状态，例如ACTIVE、DISABLED';

comment on table "v2_customers" is 'V2客户表：按用户聚合，跨渠道身份通过customer_id归并';
comment on column "v2_customers"."tenantId" is '所属租户ID';
comment on column "v2_customers"."primaryChannelId" is '主要来源渠道ID';
comment on column "v2_customers"."externalUserId" is '主要外部用户ID，例如网页访客ID或渠道openid';
comment on column "v2_customers"."nickname" is '客户昵称';
comment on column "v2_customers"."phone" is '手机号';
comment on column "v2_customers"."wechat" is '微信号';
comment on column "v2_customers"."status" is '客户状态，例如ACTIVE、BLOCKED、INVALID';
comment on column "v2_customers"."firstSeenAt" is '首次出现时间';
comment on column "v2_customers"."lastSeenAt" is '最近活跃时间';

comment on table "v2_customer_identities" is 'V2客户渠道身份表：保存同一客户在不同渠道的openid、unionid、网页访客ID等身份';
comment on column "v2_customer_identities"."tenantId" is '所属租户ID';
comment on column "v2_customer_identities"."customerId" is '归并后的客户ID';
comment on column "v2_customer_identities"."channelId" is '渠道ID';
comment on column "v2_customer_identities"."channelType" is '渠道类型代码';
comment on column "v2_customer_identities"."externalUserId" is '该渠道下的用户唯一ID';
comment on column "v2_customer_identities"."externalOpenId" is '渠道openid';
comment on column "v2_customer_identities"."externalUnionId" is '跨应用unionid';
comment on column "v2_customer_identities"."rawJson" is '渠道原始身份数据';

comment on table "v2_customer_profiles" is 'V2客户画像表：用JSON存储不同行业的动态画像字段，避免绑定单一业务流程';
comment on column "v2_customer_profiles"."tenantId" is '所属租户ID';
comment on column "v2_customer_profiles"."customerId" is '客户ID';
comment on column "v2_customer_profiles"."profileJson" is '客户画像JSON，例如预算、需求、行业特有字段';
comment on column "v2_customer_profiles"."tags" is '客户标签数组';
comment on column "v2_customer_profiles"."profileScore" is '画像完整度评分，0到100';
comment on column "v2_customer_profiles"."lastExtractedAt" is '最近一次画像抽取时间';

comment on table "v2_conversations" is 'V2会话表：一次连续咨询过程，可按用户聚合查看，也可按会话查看';
comment on column "v2_conversations"."tenantId" is '所属租户ID';
comment on column "v2_conversations"."customerId" is '客户ID';
comment on column "v2_conversations"."channelId" is '渠道ID';
comment on column "v2_conversations"."externalConversationId" is '外部会话ID，例如Coze或渠道会话ID';
comment on column "v2_conversations"."source" is '来源，例如广告、私域、官网、公众号菜单、二维码';
comment on column "v2_conversations"."sourceDetail" is '来源详情';
comment on column "v2_conversations"."statusCode" is '会话状态字典代码，例如AI_SERVING、NEED_HUMAN、HUMAN_SERVING、CLOSED';
comment on column "v2_conversations"."intentLevelCode" is '意向等级字典代码，例如A、B、C、D';
comment on column "v2_conversations"."stageCode" is '会话或线索阶段字典代码，例如NEW、QUALIFIED、PRICE_ASKED';
comment on column "v2_conversations"."summary" is '会话摘要';
comment on column "v2_conversations"."lastMessage" is '最近一条消息内容';
comment on column "v2_conversations"."messageCount" is '会话消息总数';
comment on column "v2_conversations"."assignedStaffId" is '分配的人工客服或销售ID';

comment on table "v2_messages" is 'V2消息表：保存用户、AI、人工、系统消息，content是最终展示给用户的内容';
comment on column "v2_messages"."tenantId" is '所属租户ID';
comment on column "v2_messages"."conversationId" is '会话ID';
comment on column "v2_messages"."customerId" is '客户ID';
comment on column "v2_messages"."role" is '消息角色，例如USER、AI、HUMAN、SYSTEM';
comment on column "v2_messages"."content" is '最终展示给用户或后台的消息内容';
comment on column "v2_messages"."contentType" is '消息类型，例如text、image、file、event';
comment on column "v2_messages"."messageSeq" is '会话内消息序号';
comment on column "v2_messages"."externalMessageId" is '外部消息ID';
comment on column "v2_messages"."rawJson" is '渠道或工作流原始消息JSON';

comment on table "v2_workflows" is 'V2工作流配置表：记录不同租户、渠道、用途对应的Coze或其他供应商工作流';
comment on column "v2_workflows"."tenantId" is '所属租户ID';
comment on column "v2_workflows"."channelId" is '可选渠道ID，不填代表租户通用工作流';
comment on column "v2_workflows"."provider" is '工作流供应商，例如coze、dify、custom';
comment on column "v2_workflows"."purpose" is '工作流用途，例如chat、lead_extract、quality_check';
comment on column "v2_workflows"."workflowId" is '供应商侧工作流ID';
comment on column "v2_workflows"."workflowVersion" is '工作流版本';
comment on column "v2_workflows"."modelName" is '模型名称';
comment on column "v2_workflows"."promptVersion" is '提示词版本';
comment on column "v2_workflows"."personaVersion" is '人设版本';
comment on column "v2_workflows"."configJson" is '工作流扩展配置';

comment on table "v2_ai_runs" is 'V2 AI运行记录表：记录每次AI回复的输入、原始输出、最终答案、模型和工作流版本';
comment on column "v2_ai_runs"."tenantId" is '所属租户ID';
comment on column "v2_ai_runs"."conversationId" is '会话ID';
comment on column "v2_ai_runs"."userMessageId" is '触发本次AI运行的用户消息ID';
comment on column "v2_ai_runs"."aiMessageId" is '本次AI运行产生的AI消息ID';
comment on column "v2_ai_runs"."workflowProvider" is '工作流供应商';
comment on column "v2_ai_runs"."workflowId" is '供应商侧工作流ID';
comment on column "v2_ai_runs"."workflowVersion" is '工作流版本';
comment on column "v2_ai_runs"."modelName" is '模型名称';
comment on column "v2_ai_runs"."promptVersion" is '提示词版本';
comment on column "v2_ai_runs"."personaVersion" is '人设版本';
comment on column "v2_ai_runs"."inputJson" is '发送给模型或工作流的输入JSON';
comment on column "v2_ai_runs"."rawOutput" is '模型或工作流原始输出';
comment on column "v2_ai_runs"."finalAnswer" is '最终发送给用户的答案';
comment on column "v2_ai_runs"."latencyMs" is '本次AI运行耗时，毫秒';
comment on column "v2_ai_runs"."status" is '运行状态，例如SUCCESS、FAILED';
comment on column "v2_ai_runs"."errorMessage" is '失败原因';

comment on table "v2_message_knowledge_refs" is 'V2消息知识库引用表：保存AI回复引用的Coze知识库快照，用于追踪是否篡改知识库意思';
comment on column "v2_message_knowledge_refs"."tenantId" is '所属租户ID';
comment on column "v2_message_knowledge_refs"."aiRunId" is 'AI运行记录ID';
comment on column "v2_message_knowledge_refs"."messageId" is 'AI消息ID';
comment on column "v2_message_knowledge_refs"."externalKbId" is '外部知识库ID，例如Coze知识库ID';
comment on column "v2_message_knowledge_refs"."externalDocId" is '外部知识文档ID';
comment on column "v2_message_knowledge_refs"."knowledgeTitle" is '知识标题';
comment on column "v2_message_knowledge_refs"."knowledgeContentSnapshot" is '当次回答引用的知识库原文快照';
comment on column "v2_message_knowledge_refs"."matchedText" is '命中的知识片段';
comment on column "v2_message_knowledge_refs"."similarityScore" is '相似度评分';
comment on column "v2_message_knowledge_refs"."rank" is '召回排序';

comment on table "v2_leads" is 'V2线索表：通用销售线索沉淀，意向等级、阶段、状态全部使用字典code';
comment on column "v2_leads"."tenantId" is '所属租户ID';
comment on column "v2_leads"."customerId" is '客户ID';
comment on column "v2_leads"."conversationId" is '来源会话ID';
comment on column "v2_leads"."intentLevelCode" is '意向等级代码，例如A、B、C、D';
comment on column "v2_leads"."stageCode" is '线索阶段代码，例如NEW、QUALIFIED、PRICE_ASKED、HANDOFF、WON';
comment on column "v2_leads"."statusCode" is '线索状态代码，例如OPEN、FOLLOWING、WON、LOST、INVALID';
comment on column "v2_leads"."score" is '线索分，0到100';
comment on column "v2_leads"."mainNeed" is '主要需求';
comment on column "v2_leads"."mainConcern" is '主要顾虑';
comment on column "v2_leads"."recommendedSolution" is '推荐方案，通用字段，不绑定具体行业';
comment on column "v2_leads"."nextAction" is '下一步跟进建议';
comment on column "v2_leads"."ownerStaffId" is '负责人账号ID';
comment on column "v2_leads"."lastFollowUpAt" is '最近跟进时间';

comment on table "v2_lead_events" is 'V2线索事件表：记录线索等级、阶段、状态、画像等变化，解释为什么成为高意向';
comment on column "v2_lead_events"."tenantId" is '所属租户ID';
comment on column "v2_lead_events"."leadId" is '线索ID';
comment on column "v2_lead_events"."conversationId" is '关联会话ID';
comment on column "v2_lead_events"."eventType" is '事件类型，例如INTENT_CHANGED、STAGE_CHANGED、PROFILE_UPDATED、HANDOFF、WON';
comment on column "v2_lead_events"."fromValue" is '变更前值';
comment on column "v2_lead_events"."toValue" is '变更后值';
comment on column "v2_lead_events"."reason" is '变更原因';
comment on column "v2_lead_events"."operatorType" is '操作者类型，例如AI、HUMAN、SYSTEM';
comment on column "v2_lead_events"."operatorId" is '操作者ID';

comment on table "v2_follow_ups" is 'V2跟进记录表：保存人工客服或销售的跟进行为和下次跟进时间';
comment on column "v2_follow_ups"."tenantId" is '所属租户ID';
comment on column "v2_follow_ups"."leadId" is '线索ID';
comment on column "v2_follow_ups"."customerId" is '客户ID';
comment on column "v2_follow_ups"."conversationId" is '关联会话ID';
comment on column "v2_follow_ups"."staffId" is '跟进人账号ID';
comment on column "v2_follow_ups"."followUpType" is '跟进方式，例如CALL、WECHAT、MESSAGE、NOTE';
comment on column "v2_follow_ups"."content" is '跟进内容';
comment on column "v2_follow_ups"."nextFollowUpAt" is '下次跟进时间';
comment on column "v2_follow_ups"."resultCode" is '跟进结果代码，例如CONTACTED、NO_REPLY、QUOTED、WON、LOST';

comment on table "v2_deals" is 'V2成交记录表：同时支持人工录入、Coze回传、接口同步成交状态';
comment on column "v2_deals"."tenantId" is '所属租户ID';
comment on column "v2_deals"."leadId" is '线索ID';
comment on column "v2_deals"."customerId" is '客户ID';
comment on column "v2_deals"."conversationId" is '关联会话ID';
comment on column "v2_deals"."amount" is '成交金额';
comment on column "v2_deals"."currency" is '币种，默认CNY';
comment on column "v2_deals"."dealStatusCode" is '成交状态代码，例如PENDING_PAYMENT、PAID、REFUNDED、CANCELLED';
comment on column "v2_deals"."source" is '成交来源，例如HUMAN、API、COZE、IMPORT';
comment on column "v2_deals"."externalOrderId" is '外部订单ID';
comment on column "v2_deals"."paidAt" is '付款时间';

comment on table "v2_dictionaries" is 'V2字典表：租户可配置的意向等级、线索阶段、线索状态、渠道类型、顾虑类型等';
comment on column "v2_dictionaries"."tenantId" is '所属租户ID，空值表示平台默认字典';
comment on column "v2_dictionaries"."dictType" is '字典类型，例如intent_level、lead_stage、lead_status、channel_type';
comment on column "v2_dictionaries"."code" is '字典代码';
comment on column "v2_dictionaries"."label" is '字典展示名称';
comment on column "v2_dictionaries"."description" is '字典说明';
comment on column "v2_dictionaries"."sortOrder" is '排序值';
comment on column "v2_dictionaries"."enabled" is '是否启用';
comment on column "v2_dictionaries"."metaJson" is '字典扩展配置';

comment on table "v2_kb_miss_questions" is 'V2知识库未命中/异常问题表：记录无知识、低置信、冲突、越界、语气差、改写知识库等问题';
comment on column "v2_kb_miss_questions"."tenantId" is '所属租户ID';
comment on column "v2_kb_miss_questions"."conversationId" is '关联会话ID';
comment on column "v2_kb_miss_questions"."messageId" is '关联消息ID';
comment on column "v2_kb_miss_questions"."customerId" is '客户ID';
comment on column "v2_kb_miss_questions"."question" is '客户问题';
comment on column "v2_kb_miss_questions"."aiAnswer" is 'AI当时回答';
comment on column "v2_kb_miss_questions"."missTypeCode" is '问题类型，例如NO_KB、LOW_CONFIDENCE、CONFLICT、OUT_OF_SCOPE、BAD_TONE、REWRITE_KB';
comment on column "v2_kb_miss_questions"."missReason" is '问题原因';
comment on column "v2_kb_miss_questions"."suggestedAnswer" is '建议补充答案';
comment on column "v2_kb_miss_questions"."statusCode" is '处理状态，例如PENDING、ADDED_TO_KB、IGNORED、NEED_REVIEW';
comment on column "v2_kb_miss_questions"."occurrenceCount" is '累计出现次数';
comment on column "v2_kb_miss_questions"."firstSeenAt" is '首次出现时间';
comment on column "v2_kb_miss_questions"."lastSeenAt" is '最近出现时间';

comment on table "v2_answer_quality_checks" is 'V2回答质检表：记录AI回复的知识库忠实度、真人语气、销售引导和风险等级';
comment on column "v2_answer_quality_checks"."tenantId" is '所属租户ID';
comment on column "v2_answer_quality_checks"."conversationId" is '关联会话ID';
comment on column "v2_answer_quality_checks"."messageId" is '被质检的AI消息ID';
comment on column "v2_answer_quality_checks"."aiRunId" is '关联AI运行记录ID';
comment on column "v2_answer_quality_checks"."fidelityScore" is '忠实知识库评分，0到100';
comment on column "v2_answer_quality_checks"."toneScore" is '真人语气评分，0到100';
comment on column "v2_answer_quality_checks"."helpfulnessScore" is '有用程度评分，0到100';
comment on column "v2_answer_quality_checks"."salesGuidanceScore" is '销售引导评分，0到100';
comment on column "v2_answer_quality_checks"."riskLevelCode" is '风险等级代码，例如NONE、LOW、MEDIUM、HIGH';
comment on column "v2_answer_quality_checks"."issuesJson" is '质检问题JSON，例如改写过度、语气机械、答非所问';
comment on column "v2_answer_quality_checks"."suggestion" is '质检建议';
comment on column "v2_answer_quality_checks"."reviewStatusCode" is '复核状态，例如AUTO、NEED_REVIEW、REVIEWED';

comment on table "v2_audit_logs" is 'V2操作审计日志表：记录平台管理员和租户账号的重要后台操作';
comment on column "v2_audit_logs"."tenantId" is '关联租户ID，平台级操作可为空';
comment on column "v2_audit_logs"."userId" is '操作人账号ID';
comment on column "v2_audit_logs"."action" is '操作动作';
comment on column "v2_audit_logs"."resourceType" is '资源类型';
comment on column "v2_audit_logs"."resourceId" is '资源ID';
comment on column "v2_audit_logs"."detailJson" is '操作详情JSON';
comment on column "v2_audit_logs"."ip" is '操作IP';
comment on column "v2_audit_logs"."userAgent" is '浏览器或客户端User-Agent';

-- Default dictionaries
insert into "v2_dictionaries" ("id", "tenantId", "dictType", "code", "label", "description", "sortOrder", "enabled", "createdAt", "updatedAt")
values
  ('dict_intent_a', null, 'intent_level', 'A', '高意向用户', '问价格、问套餐、说想买、愿意留联系方式或需要人工承接', 10, true, now(), now()),
  ('dict_intent_b', null, 'intent_level', 'B', '中意向用户', '提供关键信息，持续追问效果、方案、流程或适配条件', 20, true, now(), now()),
  ('dict_intent_c', null, 'intent_level', 'C', '低意向用户', '泛泛咨询，信息不完整，暂未表现出明确购买或合作动作', 30, true, now(), now()),
  ('dict_intent_d', null, 'intent_level', 'D', '风险用户', '存在投诉、禁忌、合规、售后争议或明显不适合继续自动销售的问题', 40, true, now(), now()),
  ('dict_intent_unknown', null, 'intent_level', 'UNKNOWN', '待判断', '暂未识别意向等级', 50, true, now(), now()),

  ('dict_conv_ai_serving', null, 'conversation_status', 'AI_SERVING', 'AI接待中', '会话由AI自动接待', 10, true, now(), now()),
  ('dict_conv_need_human', null, 'conversation_status', 'NEED_HUMAN', '需要人工', 'AI判断需要人工客服或销售介入', 20, true, now(), now()),
  ('dict_conv_human_serving', null, 'conversation_status', 'HUMAN_SERVING', '人工接待中', '会话已由人工接管', 30, true, now(), now()),
  ('dict_conv_closed', null, 'conversation_status', 'CLOSED', '已关闭', '会话已结束', 40, true, now(), now()),

  ('dict_stage_new', null, 'lead_stage', 'NEW', '新咨询', '新进入咨询，还未完成需求识别', 10, true, now(), now()),
  ('dict_stage_qualified', null, 'lead_stage', 'QUALIFIED', '已识别需求', '已提取客户需求或关键画像', 20, true, now(), now()),
  ('dict_stage_price_asked', null, 'lead_stage', 'PRICE_ASKED', '问价格', '客户咨询价格、费用、套餐或购买成本', 30, true, now(), now()),
  ('dict_stage_solution', null, 'lead_stage', 'SOLUTION_RECOMMENDED', '已推荐方案', 'AI或人工已给出推荐方案', 40, true, now(), now()),
  ('dict_stage_handoff', null, 'lead_stage', 'HANDOFF', '已转人工', '已转人工跟进或准备转人工', 50, true, now(), now()),
  ('dict_stage_won', null, 'lead_stage', 'WON', '已成交', '客户已成交或已付款', 60, true, now(), now()),
  ('dict_stage_lost', null, 'lead_stage', 'LOST', '已流失', '客户明确拒绝或长时间无响应', 70, true, now(), now()),
  ('dict_stage_invalid', null, 'lead_stage', 'INVALID', '无效', '无效咨询、测试、重复或非目标客户', 80, true, now(), now()),

  ('dict_lead_open', null, 'lead_status', 'OPEN', '待跟进', '线索已生成，等待跟进', 10, true, now(), now()),
  ('dict_lead_following', null, 'lead_status', 'FOLLOWING', '跟进中', '人工或系统正在持续跟进', 20, true, now(), now()),
  ('dict_lead_won', null, 'lead_status', 'WON', '已成交', '线索已成交', 30, true, now(), now()),
  ('dict_lead_lost', null, 'lead_status', 'LOST', '已流失', '线索已流失', 40, true, now(), now()),
  ('dict_lead_invalid', null, 'lead_status', 'INVALID', '无效', '无效线索', 50, true, now(), now()),

  ('dict_miss_no_kb', null, 'miss_type', 'NO_KB', '知识库缺失', '知识库没有覆盖该问题', 10, true, now(), now()),
  ('dict_miss_low_confidence', null, 'miss_type', 'LOW_CONFIDENCE', '低置信回答', 'AI回答置信度低，需要复核', 20, true, now(), now()),
  ('dict_miss_conflict', null, 'miss_type', 'CONFLICT', '知识冲突', '命中的知识之间存在冲突', 30, true, now(), now()),
  ('dict_miss_out_scope', null, 'miss_type', 'OUT_OF_SCOPE', '超出范围', '问题超出业务或合规允许范围', 40, true, now(), now()),
  ('dict_miss_bad_tone', null, 'miss_type', 'BAD_TONE', '语气不佳', '回答语气不像真人或不符合品牌人设', 50, true, now(), now()),
  ('dict_miss_rewrite_kb', null, 'miss_type', 'REWRITE_KB', '改写知识库', 'AI改变或放大了知识库原意', 60, true, now(), now()),

  ('dict_review_auto', null, 'review_status', 'AUTO', '自动质检', '系统自动生成的质检结果', 10, true, now(), now()),
  ('dict_review_need', null, 'review_status', 'NEED_REVIEW', '待人工复核', '需要人工复核', 20, true, now(), now()),
  ('dict_review_done', null, 'review_status', 'REVIEWED', '已复核', '人工已经复核', 30, true, now(), now())
on conflict ("id") do nothing;
