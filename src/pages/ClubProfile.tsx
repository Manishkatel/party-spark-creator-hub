import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, MapPin, Globe, Mail, Phone, Clock, Bell } from "lucide-react";
import ClubApplicationForm from "@/components/clubs/ClubApplicationForm";
import EventReminderDialog from "@/components/clubs/EventReminderDialog";

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
  const [club, setClub] = useState<Club | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);

  // Mock club data
  const mockClub: Club = {
    id: id || "1",
    name: "USM Computer Science Club",
    description: "A community of passionate computer science students and professionals dedicated to learning, networking, and innovation.",
    logo_url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200&h=200&fit=crop&crop=center",
    website: "https://usm-cs-club.com",
    email: "contact@usm-cs-club.com",
    phone: "(601) 266-4949",
    category: "Academic",
    totalMembers: 125,
    objective: "To foster a collaborative environment where students can enhance their programming skills, explore emerging technologies, and build professional networks in the field of computer science.",
    achievements: [
      "Winner of 2023 USM Hackathon",
      "Organized 15+ technical workshops",
      "100+ students mentored",
      "Partnership with 5 tech companies",
      "Published 20+ research papers"
    ],
    topMembers: [
      { id: "1", name: "Sarah Johnson", role: "President", avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b1c0?w=100&h=100&fit=crop", joinDate: "2022-08-15" },
      { id: "2", name: "Mike Chen", role: "Vice President", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", joinDate: "2022-09-01" },
      { id: "3", name: "Emily Davis", role: "Secretary", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", joinDate: "2023-01-20" },
      { id: "4", name: "Alex Rodriguez", role: "Treasurer", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", joinDate: "2023-02-10" }
    ],
    upcomingEvents: [
      {
        id: "1",
        title: "React Workshop",
        date: "2024-03-15",
        time: "2:00 PM",
        location: "Computer Science Building, Room 101",
        description: "Learn the fundamentals of React development",
        attendees: 45
      },
      {
        id: "2",
        title: "Tech Career Fair Prep",
        date: "2024-03-22",
        time: "4:00 PM",
        location: "Student Union, Conference Room A",
        description: "Prepare for upcoming career fair with resume reviews and mock interviews",
        attendees: 32
      }
    ],
    pastEvents: [
      {
        id: "3",
        title: "Python Bootcamp",
        date: "2024-02-15",
        time: "10:00 AM",
        location: "Computer Science Building, Room 205",
        description: "Intensive Python programming workshop for beginners",
        attendees: 67
      },
      {
        id: "4",
        title: "Industry Panel Discussion",
        date: "2024-01-28",
        time: "3:00 PM",
        location: "Student Union, Main Hall",
        description: "Panel discussion with tech industry professionals",
        attendees: 89
      }
    ]
  };

  useEffect(() => {
    // Simulate fetching club data
    setClub(mockClub);
  }, [id]);

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

  if (!club) {
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
                  <Badge variant="secondary" className="w-fit">{club.category}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{club.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{club.totalMembers} members</span>
                  </div>
                  {club.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a href={club.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        Website
                      </a>
                    </div>
                  )}
                  {club.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{club.email}</span>
                    </div>
                  )}
                  {club.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{club.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={() => setShowApplicationForm(true)} className="bg-primary hover:bg-primary/90">
                Join Club
              </Button>
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
                    <h3 className="text-lg font-semibold mb-2">Our Objective</h3>
                    <p className="text-muted-foreground">{club.objective}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">What We Do</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Weekly coding workshops and tutorials</li>
                      <li>Guest lectures from industry professionals</li>
                      <li>Hackathons and programming competitions</li>
                      <li>Networking events and career guidance</li>
                      <li>Open source project collaborations</li>
                    </ul>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {club.topMembers.map((member) => (
                      <div key={member.id} className="text-center">
                        <Avatar className="w-16 h-16 mx-auto mb-3">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-muted-foreground">Joined {formatDate(member.joinDate)}</p>
                      </div>
                    ))}
                  </div>
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
                    {club.upcomingEvents.map((event) => (
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
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees} attending</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Past Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {club.pastEvents.map((event) => (
                      <div key={event.id} className="border rounded-lg p-4 opacity-75">
                        <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                        <p className="text-muted-foreground mb-3">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{event.attendees} attended</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  {club.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{achievement}</span>
                    </div>
                  ))}
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