import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, MapPin, Globe, Mail, Phone, Clock, Bell, Edit, Trash2 } from "lucide-react";
import ClubApplicationForm from "@/components/clubs/ClubApplicationForm";
import EventReminderDialog from "@/components/clubs/EventReminderDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ClubMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  joinDate: string;
}

interface ClubEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
}

interface Club {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  category: string;
  totalMembers: number;
  objective: string;
  achievements: string[];
  topMembers: ClubMember[];
  upcomingEvents: ClubEvent[];
  pastEvents: ClubEvent[];
}

const ClubProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [club, setClub] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (id) {
      checkAuth();
      fetchClubData();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    // Check if user has already joined this club
    if (user && id) {
      const { data } = await supabase
        .from('club_members')
        .select('id')
        .eq('user_id', user.id)
        .eq('club_id', id)
        .single();
      
      setHasJoined(!!data);
    }
  };

  const fetchClubData = async () => {
    try {
      // Fetch club details
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single();

      if (clubError) {
        console.error('Error fetching club:', clubError);
        toast({
          title: "Error",
          description: "Club not found",
          variant: "destructive",
        });
        navigate('/clubs');
        return;
      }

      setClub(clubData);
      setIsOwner(user?.id === clubData.owner_id);

      // Fetch related data in parallel
      const [eventsResult, boardMembersResult, achievementsResult] = await Promise.all([
        supabase.from('events').select('*').eq('club_id', id),
        supabase.from('board_members').select('*').eq('club_id', id),
        supabase.from('achievements').select('*').eq('club_id', id)
      ]);

      setEvents(eventsResult.data || []);
      setBoardMembers(boardMembersResult.data || []);
      setAchievements(achievementsResult.data || []);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load club data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClub = () => {
    navigate(`/club/${id}/edit`);
  };

  const handleDeleteClub = async () => {
    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Club deleted successfully",
      });
      navigate('/clubs');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete club",
        variant: "destructive",
      });
    }
  };

  const handleJoinClub = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to join a club",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('club_members')
        .insert({
          user_id: user.id,
          club_id: id
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Joined",
            description: "You've already joined this club",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setHasJoined(true);
      toast({
        title: "Success",
        description: `You've joined ${club.name}!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join club",
        variant: "destructive",
      });
    }
  };

  const handleLeaveClub = async () => {
    try {
      const { error } = await supabase
        .from('club_members')
        .delete()
        .eq('user_id', user.id)
        .eq('club_id', id);

      if (error) throw error;

      setHasJoined(false);
      toast({
        title: "Left Club",
        description: `You've left ${club.name}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to leave club",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSetReminder = (event: ClubEvent) => {
    setSelectedEvent(event);
    setShowReminderDialog(true);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Loading...</h2>
            <p className="text-muted-foreground">Fetching club information</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!club) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Club Not Found</h2>
            <p className="text-muted-foreground">The club you're looking for doesn't exist</p>
            <Button onClick={() => navigate('/clubs')} className="mt-4">
              Back to Clubs
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Club Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={club.logo_url} alt={club.name} />
                <AvatarFallback className="text-2xl">{club.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <h1 className="text-3xl font-bold">{club.name}</h1>
                  <Badge variant="secondary" className="w-fit">
                    {club.club_type === 'other' ? club.custom_type : club.club_type}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{club.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{boardMembers.length} board members</span>
                  </div>
                  {club.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a href={club.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        Website
                      </a>
                    </div>
                  )}
                  {club.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{club.contact_email}</span>
                    </div>
                  )}
                  {club.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{club.contact_phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isOwner ? (
                  <>
                    <Button onClick={handleEditClub} variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Club
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Club
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Club</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{club.name}"? This action cannot be undone and will remove all associated events, members, and data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteClub}>
                            Delete Club
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    {!hasJoined ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-primary hover:bg-primary/90">
                            Join Club
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Join Club</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to join "{club.name}"? You'll become a member and receive updates about club activities.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleJoinClub}>
                              Join Club
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline">
                            Leave Club
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave Club</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to leave "{club.name}"? You'll no longer be a member and won't receive club updates.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeaveClub}>
                              Leave Club
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="information" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="information">
            <Card>
              <CardHeader>
                <CardTitle>About Our Club</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About Our Club</h3>
                    <p className="text-muted-foreground">{club.description}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      {club.contact_email && (
                        <p className="text-muted-foreground">Email: {club.contact_email}</p>
                      )}
                      {club.contact_phone && (
                        <p className="text-muted-foreground">Phone: {club.contact_phone}</p>
                      )}
                      {club.website && (
                        <p className="text-muted-foreground">
                          Website: <a href={club.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">{club.website}</a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Leadership Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {boardMembers.map((member) => (
                      <div key={member.id} className="text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-3">
                          <AvatarImage src={member.photo_url} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.position || 'Member'}</p>
                        {member.year_in_college && (
                          <p className="text-xs text-muted-foreground">{member.year_in_college}</p>
                        )}
                        {member.joined_date && (
                          <p className="text-xs text-muted-foreground">Joined {formatDate(member.joined_date)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {boardMembers.length === 0 && (
                    <p className="text-center text-muted-foreground">No board members listed yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.filter(event => new Date(event.event_date) > new Date()).map((event) => (
                      <div key={event.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetReminder(event)}
                            className="ml-4"
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Remind Me
                          </Button>
                        </div>
                        <p className="text-muted-foreground mb-3">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {events.filter(event => new Date(event.event_date) > new Date()).length === 0 && (
                      <p className="text-center text-muted-foreground">No upcoming events scheduled.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Past Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.filter(event => new Date(event.event_date) <= new Date()).map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 opacity-75">
                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                        <p className="text-muted-foreground mb-3">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.event_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {events.filter(event => new Date(event.event_date) <= new Date()).length === 0 && (
                      <p className="text-center text-muted-foreground">No past events.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Our Achievements</CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <span className="font-medium">{achievement.title}</span>
                          {achievement.description && (
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          )}
                          {achievement.date_achieved && (
                            <p className="text-xs text-muted-foreground">{formatDate(achievement.date_achieved)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {achievements.length === 0 && (
                      <p className="text-center text-muted-foreground">No achievements recorded yet.</p>
                    )}
                  </div>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Application Form Dialog */}
        <ClubApplicationForm
          club={club}
          isOpen={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
        />

        {/* Event Reminder Dialog */}
        <EventReminderDialog
          event={selectedEvent}
          isOpen={showReminderDialog}
          onClose={() => setShowReminderDialog(false)}
        />
      </div>
    </Layout>
  );
};

export default ClubProfile;