-- Create roles enum
CREATE TYPE user_role AS ENUM (
  'admin',
  'host',
  'brand_partner',
  'vendor',
  'affiliate',
  'viewer',
  'moderator'
);

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255),
  avatar_url TEXT,
  role user_role DEFAULT 'viewer',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user permissions table
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permission VARCHAR(255) NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission)
);

-- Create role permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, permission)
);

-- Create live streams table
CREATE TABLE public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  room_name VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  thumbnail_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create stream participants table
CREATE TABLE public.stream_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(stream_id, user_id)
);

-- Create stream recordings table
CREATE TABLE public.stream_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  asset_id VARCHAR(255),
  duration INTEGER,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster chat queries
CREATE INDEX idx_chat_messages_stream_id ON public.chat_messages(stream_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Create default role permissions
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin', 'manage_users'),
  ('admin', 'manage_streams'),
  ('admin', 'moderate_chat'),
  ('admin', 'view_analytics'),
  ('admin', 'manage_roles'),
  ('host', 'create_stream'),
  ('host', 'manage_own_stream'),
  ('host', 'view_own_analytics'),
  ('host', 'invite_guests'),
  ('brand_partner', 'create_stream'),
  ('brand_partner', 'view_analytics'),
  ('brand_partner', 'manage_campaigns'),
  ('vendor', 'manage_products'),
  ('vendor', 'view_sales'),
  ('affiliate', 'view_commissions'),
  ('affiliate', 'manage_network'),
  ('viewer', 'watch_streams'),
  ('viewer', 'chat'),
  ('moderator', 'moderate_chat'),
  ('moderator', 'manage_viewers');

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin')
  );

-- Create RLS policies for live_streams
CREATE POLICY "Public streams viewable by all" ON public.live_streams
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own streams" ON public.live_streams
  FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Hosts can create streams" ON public.live_streams
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.users 
      WHERE role IN ('admin', 'host', 'brand_partner')
    )
  );

CREATE POLICY "Hosts can update their streams" ON public.live_streams
  FOR UPDATE USING (auth.uid() = host_id);

-- Create RLS policies for chat messages
CREATE POLICY "Users can view messages from public streams" ON public.chat_messages
  FOR SELECT USING (
    stream_id IN (
      SELECT id FROM public.live_streams WHERE is_public = true
    )
  );

CREATE POLICY "Stream participants can view messages" ON public.chat_messages
  FOR SELECT USING (
    stream_id IN (
      SELECT stream_id FROM public.stream_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in streams they're in" ON public.chat_messages
  FOR INSERT WITH CHECK (
    stream_id IN (
      SELECT stream_id FROM public.stream_participants 
      WHERE user_id = auth.uid()
    ) OR
    user_id = auth.uid()
  );
