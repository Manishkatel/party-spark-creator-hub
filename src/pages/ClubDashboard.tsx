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
        .eq('owner_id', user.user_id) // Use user_id instead of id
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
        .eq('created_by', user.id)
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

  const handleDeleteClub = async (clubId: string) => {
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete club",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Club deleted successfully",
      });
      fetchUserData();
    }
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

        {/* My Clubs Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Building className="h-6 w-6" />
              My Clubs ({clubs.length})
            </h2>
          </div>
          
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClub(club.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {clubs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No clubs created yet</p>
                  <Button onClick={() => navigate('/club/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Club
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* My Events Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              My Events ({allEvents.length})
            </h2>
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
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No events created yet</p>
                  <Button onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClubDashboard;