-- Create table for web push subscriptions
CREATE TABLE IF NOT EXISTS public.webpush_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE public.webpush_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own push subscriptions" 
ON public.webpush_subscriptions 
FOR ALL 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_webpush_subscriptions_user_id ON public.webpush_subscriptions (user_id);
CREATE INDEX idx_webpush_subscriptions_active ON public.webpush_subscriptions (is_active) WHERE is_active = true;

-- Add trigger for updated_at
CREATE TRIGGER update_webpush_subscriptions_updated_at
  BEFORE UPDATE ON public.webpush_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webpush_subscriptions TO authenticated;