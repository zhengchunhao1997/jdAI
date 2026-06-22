create table if not exists customer_leads (
  id text primary key,
  sys_platform text,
  uuid text,
  bstudio_create_time timestamptz,
  user_id text not null,
  nickname text,
  height text,
  weight text,
  target_weight text,
  main_concern text,
  risk_flag boolean default false,
  risk_type text,
  intent_level text,
  current_stage text,
  recommended_package text,
  last_user_message text,
  last_ai_reply text,
  lead_summary text,
  next_action text,
  follow_up_time timestamptz,
  profile_json jsonb,
  owner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_customer_leads_user_id on customer_leads (user_id);
create index if not exists idx_customer_leads_intent_level on customer_leads (intent_level);
create index if not exists idx_customer_leads_next_action on customer_leads (next_action);
create index if not exists idx_customer_leads_updated_at on customer_leads (updated_at desc);

create table if not exists conversation_events (
  id text primary key,
  sys_platform text,
  uuid text,
  bstudio_create_time timestamptz,
  event_id text,
  lead_id text,
  user_id text not null,
  event_type text,
  user_message text,
  ai_reply text,
  intent_level text,
  next_action text,
  risk_flag boolean default false,
  risk_type text,
  message_summary text,
  created_at timestamptz default now()
);

create index if not exists idx_conversation_events_user_id on conversation_events (user_id);
create index if not exists idx_conversation_events_lead_id on conversation_events (lead_id);
create index if not exists idx_conversation_events_intent_level on conversation_events (intent_level);
create index if not exists idx_conversation_events_created_at on conversation_events (created_at desc);

create table if not exists kb_miss_questions (
  id text primary key,
  sys_platform text,
  uuid text,
  bstudio_create_time timestamptz,
  miss_id text,
  user_id text,
  chat_history text,
  ai_reply text,
  nickname text,
  miss_reason text,
  route text,
  status text,
  suggested_answer text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_message text
);

create index if not exists idx_kb_miss_questions_user_id on kb_miss_questions (user_id);
create index if not exists idx_kb_miss_questions_status on kb_miss_questions (status);
create index if not exists idx_kb_miss_questions_route on kb_miss_questions (route);
create index if not exists idx_kb_miss_questions_created_at on kb_miss_questions (created_at desc);
