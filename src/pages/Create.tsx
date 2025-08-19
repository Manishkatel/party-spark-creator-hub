
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import EventForm from "@/components/events/EventForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Create = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user has club role
      if (parsedUser.role !== 'club') {
        toast({
          title: "Access Denied",
          description: "Only club accounts can create events.",
          variant: "destructive",
        });
      }
    } else {
      // Redirect to auth if not logged in
      window.location.href = "/auth";
      return;
    }
    setLoading(false);
  }, [toast]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto pt-8 pb-16">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">
                Please sign in to create events.
              </p>
              <Button onClick={() => window.location.href = "/auth"}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (user.role !== 'club') {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Club Account Required</h3>
              <p className="text-muted-foreground mb-4">
                Only club accounts can create events. If you represent a club or organization, 
                please create a club account to start organizing events.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => window.location.href = "/"}>
                  Back to Home
                </Button>
                <Button onClick={() => window.location.href = "/auth"}>
                  Create Club Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pt-8 pb-16">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground mt-2">
            Organize an amazing event for your club and the university community.
          </p>
        </div>
        <EventForm />
      </div>
    </Layout>
  );
};

export default Create;
