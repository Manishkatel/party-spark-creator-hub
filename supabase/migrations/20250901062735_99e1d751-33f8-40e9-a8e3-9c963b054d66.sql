-- Create event_stars table for user event interests
CREATE TABLE public.event_stars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.event_stars ENABLE ROW LEVEL SECURITY;

-- Create policies for event_stars
CREATE POLICY "Users can view their own starred events" 
ON public.event_stars 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can star events" 
ON public.event_stars 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unstar events" 
ON public.event_stars 
FOR DELETE 
USING (auth.uid() = user_id);