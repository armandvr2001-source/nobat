-- Run this once in Supabase: SQL Editor > New query
create table bookings (
  id bigint generated always as identity primary key,
  day date not null,
  slot smallint not null check (slot between 0 and 2),
  name text not null,
  phone text not null,
  created_at timestamptz default now(),
  unique (day, slot)   -- prevents double booking
);
-- RLS on with no policies: the public key can't read or write anything.
-- Only the server (service key) can access the table.
alter table bookings enable row level security;
