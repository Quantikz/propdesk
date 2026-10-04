-- Admin-managed firm extras and a rule-change log.
alter table firms add column if not exists challenge_rules text not null default '';
alter table firms add column if not exists funded_rules text not null default '';
alter table firms add column if not exists denials text not null default '';

create table if not exists rule_changes (
  id         serial primary key,
  firm_id    text not null,
  checked_at timestamptz not null default now(),
  before     text not null,
  after      text not null
);
