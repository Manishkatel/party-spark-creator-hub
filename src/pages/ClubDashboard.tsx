import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, Calendar, Award, Settings, User, FileText, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClubDashboard = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalClubs: 0,
    totalEvents: 0,
    totalApplications: 0,
    totalMembers: 0
  });
  const [loading, setLoading] = useState(true);

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

  const fetchUserData = async () => {
    setLoading(true);
    
    try {
      // Fetch all user's clubs
      const { data: userClubs } = await supabase
        .from('clubs')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (!userClubs || userClubs.length === 0) {
        setLoading(false);
        return;
      }
      
      setClubs(userClubs);
      
      // Set selected club based on URL param or default to first club
      const currentClub = clubId 
        ? userClubs.find(club => club.id === clubId) 
        : userClubs[0];
      setSelectedClub(currentClub);
      
      // Fetch all events for all clubs
      const { data: events } = await supabase
        .from('events')
        .select('*, clubs(name)')
        .in('club_id', userClubs.map(club => club.id))
        .order('event_date', { ascending: false });
      
      setAllEvents(events || []);
      
      // Calculate overall stats
      const [applicationsResult, boardMembersResult] = await Promise.all([
        supabase.from('club_applications' as any).select('id').in('club_id', userClubs.map(club => club.id)),
        supabase.from('board_members' as any).select('id').in('club_id', userClubs.map(club => club.id))
      ]);
      
      setStats({
        totalClubs: userClubs.length,
        totalEvents: events?.length || 0,
        totalApplications: applicationsResult.data?.length || 0,
        totalMembers: boardMembersResult.data?.length || 0
      });
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClubSelect = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    setSelectedClub(club);
    navigate(`/club/${clubId}/dashboard`, { replace: true });
  };

  const handleCreateEvent = () => {
    if (selectedClub) {
      navigate('/create', { state: { selectedClubId: selectedClub.id } });
    } else {
      navigate('/create');
    }
  };

  const handleEditClub = (clubId: string) => {
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
      fetchUserData();
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

  if (!clubs.length) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto pt-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Club Dashboard</CardTitle>
              <CardDescription>You haven't created any clubs yet. Get started by creating your first club!</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <Button onClick={() => navigate('/club/create')} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Club
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto pt-8 pb-16">
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Club Dashboard</h1>
            <p className="text-muted-foreground">Manage your clubs and events</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/club/create')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Club
            </Button>
            <Button onClick={handleCreateEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Club Selector */}
        {clubs.length > 1 && (
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Select Club to Manage:</label>
            <Select value={selectedClub?.id || ''} onValueChange={handleClubSelect}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a club" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClubs}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Board Members</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clubs">My Clubs</TabsTrigger>
            <TabsTrigger value="events">All Events</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleCreateEvent} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                  <Button 
                    onClick={() => navigate('/club/create')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Create New Club
                  </Button>
                  <Button 
                    onClick={() => navigate('/my-events')} 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Events
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• {stats.totalEvents} total events created</p>
                    <p>• {stats.totalApplications} pending applications</p>
                    <p>• {stats.totalMembers} board members across all clubs</p>
                    <p>• {stats.totalClubs} clubs managed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {(event as any).clubs?.name} • {new Date(event.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditEvent(event.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {allEvents.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No events created yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clubs">
            <div className="grid gap-4">
              {clubs.map((club) => (
                <Card key={club.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{club.name}</h3>
                        <p className="text-sm text-muted-foreground">{club.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">
                            {club.club_type === 'other' ? club.custom_type : club.club_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(club.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/club/${club.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClub(club.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">All Events</h2>
              <Button onClick={handleCreateEvent}>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
            
            <div className="grid gap-4">
              {allEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {(event as any).clubs?.name} • {new Date(event.event_date).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 items-center mt-2">
                          <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                            {event.status || 'active'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.share_count || 0} shares
                          </span>
                        </div>
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
              {allEvents.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">No events created yet</p>
                    <Button onClick={handleCreateEvent} className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <p className="text-sm text-muted-foreground">{user?.full_name || 'Not set'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              {selectedClub && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Selected Club Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Club Name</label>
                      <p className="text-sm text-muted-foreground">{selectedClub.name}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Club Type</label>
                      <p className="text-sm text-muted-foreground capitalize">
                        {selectedClub.club_type === 'other' ? selectedClub.custom_type : selectedClub.club_type}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Contact Email</label>
                      <p className="text-sm text-muted-foreground">{selectedClub.contact_email || 'Not set'}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleEditClub(selectedClub.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Club Details
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClubDashboard;