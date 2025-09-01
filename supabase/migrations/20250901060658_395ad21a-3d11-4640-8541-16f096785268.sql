-- Create event attendees table to track who joined which events
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Create policies for event attendees
CREATE POLICY "Users can view their own event attendance" 
ON public.event_attendees 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can join events" 
ON public.event_attendees 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave events" 
ON public.event_attendees 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Event creators can view attendees" 
ON public.event_attendees 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_attendees.event_id 
  AND events.created_by = auth.uid()
));

-- Create club members table to track who joined which clubs  
CREATE TABLE public.club_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  club_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, club_id)
);

-- Enable RLS
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;

-- Create policies for club members
CREATE POLICY "Users can view their own club memberships" 
ON public.club_members 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can join clubs" 
ON public.club_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clubs" 
ON public.club_members 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Club owners can view members" 
ON public.club_members 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM clubs 
  WHERE clubs.id = club_members.club_id 
  AND clubs.owner_id = auth.uid()
));