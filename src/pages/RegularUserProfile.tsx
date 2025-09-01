import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Settings, Calendar, Star, Users, Edit, Trash2, Eye, MapPin, Clock, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EventDetailsDialog from "@/components/events/EventDetailsDialog";

const RegularUserProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  const [starredEvents, setStarredEvents] = useState<any[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({ full_name: "", email: "" });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!profileData || profileData.role === 'club') {
      toast({
        title: "Access Denied",
        description: "This page is for regular users only.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    setUser(user);
    setProfile(profileData);
    setEditedProfile({
      full_name: profileData.full_name || "",
      email: profileData.email || ""
    });
  };

  const fetchUserData = async () => {
    setLoading(true);
    
    try {
      // Fetch joined events
      const { data: attendeeData } = await supabase
        .from('event_attendees')
        .select('event_id')
        .eq('user_id', user.id);

      if (attendeeData && attendeeData.length > 0) {
        const eventIds = attendeeData.map(item => item.event_id);
        const { data: eventsData } = await supabase
          .from('events')
          .select('*, clubs(name)')
          .in('id', eventIds);
        
        setJoinedEvents(eventsData || []);
      } else {
        setJoinedEvents([]);
      }

      // Fetch starred events
      const { data: starredData } = await supabase
        .from('event_stars')
        .select('event_id')
        .eq('user_id', user.id);

      if (starredData && starredData.length > 0) {
        const starredEventIds = starredData.map(item => item.event_id);
        const { data: starredEventsData } = await supabase
          .from('events')
          .select('*, clubs(name)')
          .in('id', starredEventIds);
        
        setStarredEvents(starredEventsData || []);
      } else {
        setStarredEvents([]);
      }

      // Fetch joined clubs
      const { data: memberData } = await supabase
        .from('club_members')
        .select('club_id')
        .eq('user_id', user.id);

      if (memberData && memberData.length > 0) {
        const clubIds = memberData.map(item => item.club_id);
        const { data: clubsData } = await supabase
          .from('clubs')
          .select('*')
          .in('id', clubIds);
        
        setJoinedClubs(clubsData || []);
      } else {
        setJoinedClubs([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editedProfile.full_name,
          email: editedProfile.email
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({
        ...profile,
        full_name: editedProfile.full_name,
        email: editedProfile.email
      });
      setEditMode(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);

      if (error) throw error;

      setJoinedEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Success",
        description: "Left event successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave event",
        variant: "destructive",
      });
    }
  };

  const handleUnstarEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('event_stars')
        .delete()
        .eq('user_id', user.id)
        .eq('event_id', eventId);

      if (error) throw error;

      setStarredEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Success",
        description: "Removed from starred events",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unstar event",
        variant: "destructive",
      });
    }
  };

  const handleLeaveClub = async (clubId: string) => {
    try {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('user_id', user.id)
        .eq('club_id', clubId);

      if (error) throw error;

      setJoinedClubs(prev => prev.filter(club => club.id !== clubId));
      toast({
        title: "Success",
        description: "Left club successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave club",
        variant: "destructive",
      });
    }
  };

  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto pt-8">
          <Card>
            <CardContent className="text-center py-12">
              <p>Loading profile...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your profile and view your activity</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile Settings</TabsTrigger>
            <TabsTrigger value="events">Joined Events</TabsTrigger>
            <TabsTrigger value="starred">Starred Events</TabsTrigger>
            <TabsTrigger value="clubs">Joined Clubs</TabsTrigger>
          </TabsList>

          {/* Profile Settings Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Full Name</Label>
                      <p className="text-sm text-muted-foreground">{profile?.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm text-muted-foreground">{profile?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Type</Label>
                      <Badge variant="secondary">Regular User</Badge>
                    </div>
                    <Button onClick={() => setEditMode(true)} className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={editedProfile.full_name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} className="flex-1">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Joined Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Joined Events ({joinedEvents.length})
              </h2>
            </div>
            
            <div className="grid gap-4">
              {joinedEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {(event as any).clubs?.name} • {new Date(event.event_date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.event_date).toLocaleTimeString()}
                          </div>
                          {event.price > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${event.price}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEvent(event)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Leave Event</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to leave "{event.title}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleLeaveEvent(event.id)}>
                                Leave Event
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {joinedEvents.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't joined any events yet</p>
                    <Button onClick={() => navigate('/events')}>
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Starred Events Tab */}
          <TabsContent value="starred" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Star className="h-6 w-6" />
                Starred Events ({starredEvents.length})
              </h2>
            </div>
            
            <div className="grid gap-4">
              {starredEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {(event as any).clubs?.name} • {new Date(event.event_date).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(event.event_date).toLocaleTimeString()}
                          </div>
                          {event.price > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${event.price}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEvent(event)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Star className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Star</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove "{event.title}" from your starred events?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUnstarEvent(event.id)}>
                                Remove Star
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {starredEvents.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't starred any events yet</p>
                    <Button onClick={() => navigate('/events')}>
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Joined Clubs Tab */}
          <TabsContent value="clubs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Joined Clubs ({joinedClubs.length})
              </h2>
            </div>
            
            <div className="grid gap-4">
              {joinedClubs.map((club) => (
                <Card key={club.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{club.name}</h3>
                        <p className="text-sm text-muted-foreground">{club.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">
                            {club.club_type === 'other' ? club.custom_type : club.club_type}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/club/${club.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Leave Club</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to leave "{club.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleLeaveClub(club.id)}>
                                Leave Club
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {joinedClubs.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">You haven't joined any clubs yet</p>
                    <Button onClick={() => navigate('/clubs')}>
                      Browse Clubs
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </Layout>
  );
};

export default RegularUserProfile;