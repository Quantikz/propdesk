-- Staff zone: roster + internal support / mod channels.
create table if not exists staff_members (
  email      text primary key,
  role       text not null check (role in ('admin', 'support', 'mod')),
  name       text not null default '',
  created_at timestamptz default CURRENT_TIMESTAMP not null
);

create table if not exists staff_messages (
  id         text primary key,
  channel    text not null check (channel in ('support', 'mods')),
  author     text not null,
  role       text not null,
  body       text not null,
  created_at timestamptz default CURRENT_TIMESTAMP not null
);

create index if not exists staff_messages_channel_idx
  on staff_messages (channel, created_at);
