-- Wellness ecosystem tables for Telegram Mini App
-- User ID = Telegram user ID (text, no Supabase Auth)

create table if not exists wellness_events (
  id text primary key,
  user_id text not null,
  type text not null,
  timestamp bigint not null,
  date_key text not null,
  payload jsonb not null default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_wellness_events_user_date on wellness_events (user_id, date_key);
create index if not exists idx_wellness_events_user_type on wellness_events (user_id, type);
create index if not exists idx_wellness_events_timestamp on wellness_events (user_id, timestamp);

create table if not exists user_wellness_state (
  user_id text primary key,
  state jsonb not null default '{}',
  updated_at timestamptz default now()
);
