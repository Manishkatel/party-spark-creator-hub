import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Calendar, Award, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClubDashboard = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [stats, setStats] = useState({
    applications: 0,
    members: 0,
    activeEvents: 0,
    achievements: 0
  });
  const [events, setEvents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && clubId) {
      fetchClubData();
    }
  }, [user, clubId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (!profile || profile.role !== 'club') {
      toast({
        title: "Access Denied",
        description: "Only club accounts can access this dashboard.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    setUser({ ...user, ...profile });
  };

  const fetchClubData = async () => {
    setLoading(true);
    
    // Fetch club details
    const { data: clubData } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .eq('owner_id', user.id)
      .single();
    
    if (!clubData) {
      toast({
        title: "Club not found",
        description: "This club doesn't exist or you don't have permission to access it.",
        variant: "destructive",
      });
      navigate('/clubs');
      return;
    }
    
    setClub(clubData);

    // Fetch statistics  
    const [applicationsResult, eventsResult, achievementsResult, boardMembersResult] = await Promise.all([
      supabase.from('club_applications' as any).select('id').eq('club_id', clubId),
      supabase.from('events').select('*').eq('club_id', clubId),
      supabase.from('achievements' as any).select('*').eq('club_id', clubId),
      supabase.from('board_members' as any).select('*').eq('club_id', clubId)
    ]);

    setStats({
      applications: applicationsResult.data?.length || 0,
      members: boardMembersResult.data?.length || 0,
      activeEvents: eventsResult.data?.filter((e: any) => e.status === 'active').length || 0,
      achievements: achievementsResult.data?.length || 0
    });

    setEvents(eventsResult.data || []);
    setAchievements(achievementsResult.data || []);
    setBoardMembers(boardMembersResult.data || []);
    setLoading(false);
  };

  const handleEditClub = () => {
    navigate(`/club/${clubId}/edit`);
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/event/${eventId}/edit`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      fetchClubData();
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto pt-8">
          <Card>
            <CardContent className="text-center py-12">
              <p>Loading dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!club) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto pt-8">
          <Card>
            <CardContent className="text-center py-12">
              <p>Club not found</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pt-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{club.name}</h1>
            <p className="text-muted-foreground">{club.description}</p>
          </div>
          <Button onClick={handleEditClub} variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Club
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Board Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.members}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEvents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.achievements}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="members">Board Members</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Events</h2>
              <Button onClick={() => navigate('/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </div>
            
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                        <Badge variant={(event as any).status === 'active' ? 'default' : 'secondary'}>
                          {(event as any).status || 'active'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Board Members</h2>
              <Button onClick={() => navigate(`/club/${clubId}/members/add`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
            
            <div className="grid gap-4">
              {boardMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.position}</p>
                        <p className="text-sm text-muted-foreground">{member.year_in_college}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Achievements</h2>
              <Button onClick={() => navigate(`/club/${clubId}/achievements/add`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Achievement
              </Button>
            </div>
            
            <div className="grid gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {achievement.date_achieved && new Date(achievement.date_achieved).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="applications">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Club Applications</h2>
            </div>
            <p className="text-muted-foreground">Applications functionality coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClubDashboard;