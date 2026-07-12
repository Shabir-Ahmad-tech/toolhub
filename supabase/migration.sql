-- Run this entire script in Supabase SQL Editor
-- ============================================
-- ToolHub Database Schema
-- ============================================

-- 1. PROFILES (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'lifetime')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_subscription_status TEXT DEFAULT 'incomplete',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. TOOL_USAGE (anonymous, for popularity ranking)
CREATE TABLE IF NOT EXISTS tool_usage (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tool_slug TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  country TEXT DEFAULT 'US',
  is_pro BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_tool_usage_slug ON tool_usage(tool_slug);
CREATE INDEX IF NOT EXISTS idx_tool_usage_date ON tool_usage(used_at);
CREATE INDEX IF NOT EXISTS idx_tool_usage_slug_date ON tool_usage(tool_slug, used_at);

-- 3. SAVED_CALCULATIONS (Pro user feature)
CREATE TABLE IF NOT EXISTS saved_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE saved_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own saved calculations"
  ON saved_calculations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_calc_user ON saved_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_calc_tool ON saved_calculations(tool_slug);

-- 4. BLOG_POSTS (SEO content)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published);

-- 5. SUBSCRIPTION_EVENTS (Stripe webhook audit log)
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_user ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_stripe ON subscription_events(stripe_event_id);

-- 6. API_KEYS (for API access revenue stream)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  name TEXT NOT NULL DEFAULT 'Default',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'business', 'enterprise')),
  requests_today INT DEFAULT 0,
  requests_total INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own API keys"
  ON api_keys FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);

-- 7. API_USAGE_LOG (for rate limiting)
CREATE TABLE IF NOT EXISTS api_usage_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  input_data JSONB,
  response_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_key ON api_usage_log(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage_log(created_at);

-- 8. AUTO-CREATE PROFILE ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();