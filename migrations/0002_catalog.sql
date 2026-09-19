-- Shared catalog (unowned). Trader tickets stay in the browser.
create table if not exists firms (
  id               text primary key,
  name             text not null,
  short            text not null,
  color            text not null,
  support_email    text not null,
  portal           text not null,
  models           text not null,
  platforms        text not null,
  profit_split     text not null,
  payout_cycle     text not null,
  payout_sla_days  integer not null default 3,
  max_account      text not null,
  drawdown         text not null,
  consistency      text not null,
  news             text not null,
  ea               text not null,
  kyc              text not null,
  notes            text not null,
  sort_rank        integer not null default 100
);

create table if not exists firm_links (
  id       serial primary key,
  firm_id  text not null references firms(id) on delete cascade,
  kind     text not null,
  title    text not null,
  url      text not null,
  unique (firm_id, kind, url)
);

create table if not exists faqs (
  id        serial primary key,
  firm_id   text not null references firms(id) on delete cascade,
  sort      integer not null default 0,
  question  text not null,
  answer    text not null
);

create table if not exists plans (
  id       serial primary key,
  firm_id  text not null references firms(id) on delete cascade,
  sort     integer not null default 0,
  kind     text not null,
  name     text not null,
  target   text not null,
  daily    text not null,
  max_dd   text not null,
  note     text not null
);

create table if not exists first_payouts (
  firm_id      text primary key references firms(id) on delete cascade,
  kyc          text not null,
  min_days     text not null,
  consistency  text not null,
  news         text not null,
  request      text not null
);

create table if not exists search_hosts (
  firm_id  text not null references firms(id) on delete cascade,
  host     text not null,
  primary key (firm_id, host)
);

create index if not exists faqs_firm_idx on faqs (firm_id, sort);
create index if not exists plans_firm_idx on plans (firm_id, sort);
create index if not exists links_firm_idx on firm_links (firm_id);
