-- Tables pour dashboard stylist

-- Disponibilités
CREATE TABLE IF NOT EXISTS public.availabilities (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references auth.users(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  created_at timestamptz default now()
);

-- Notes clients privées
CREATE TABLE IF NOT EXISTS public.client_notes (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references auth.users(id) on delete cascade,
  note text,
  created_at timestamptz default now()
);

-- Messages stylist ↔ client (option Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid,
  sender_id uuid references auth.users(id),
  receiver_id uuid references auth.users(id),
  body text,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "stylist_rw" ON availabilities
  FOR ALL USING (stylist_id = auth.uid());

CREATE POLICY "stylist_rw_notes" ON client_notes
  FOR ALL USING (stylist_id = auth.uid());

CREATE POLICY "chat_participants" ON messages
  FOR ALL USING (sender_id = auth.uid() OR receiver_id = auth.uid());