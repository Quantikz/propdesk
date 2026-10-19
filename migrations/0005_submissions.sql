create table if not exists submissions (
  id text primary key,
  kind text not null,
  firm_name text,
  official_website text,
  contact_name text not null,
  email text not null,
  role text,
  enquiry_type text not null,
  message text not null,
  source_url text,
  status text not null default 'Received',
  created_at timestamptz not null default now()
);
