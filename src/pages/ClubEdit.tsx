import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ClubEdit = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    logo_url: "",
    club_type: "",
    custom_type: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndFetchClub();
  }, [clubId]);

  const checkAuthAndFetchClub = async () => {
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
        description: "Only club accounts can edit clubs.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    setUser({ ...user, ...profile });

    // Fetch club data
    const { data: clubData, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', clubId)
      .eq('owner_id', user.id)
      .single();

    if (error || !clubData) {
      toast({
        title: "Error",
        description: "Club not found or you don't have permission to edit it.",
        variant: "destructive",
      });
      navigate('/clubs');
      return;
    }

    setFormData({
      name: clubData.name || "",
      description: clubData.description || "",
      contact_email: clubData.contact_email || "",
      contact_phone: clubData.contact_phone || "",
      website: clubData.website || "",
      logo_url: clubData.logo_url || "",
      club_type: (clubData as any).club_type || "",
      custom_type: (clubData as any).custom_type || ""
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clubId) return;

    setLoading(true);
    
    const { error } = await supabase
      .from('clubs')
      .update({
        name: formData.name,
        description: formData.description,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        website: formData.website,
        logo_url: formData.logo_url,
        club_type: formData.club_type === 'other' ? 'other' : formData.club_type,
        custom_type: formData.club_type === 'other' ? formData.custom_type : null
      })
      .eq('id', clubId)
      .eq('owner_id', user.user_id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update club",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Club updated successfully"
      });
      navigate(`/club/${clubId}/dashboard`);
    }
    
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const clubTypes = [
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'technical', label: 'Technical' },
    { value: 'social', label: 'Social' },
    { value: 'professional', label: 'Professional' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-8 pb-16">
        <Card>
          <CardHeader>
            <CardTitle>Edit Club</CardTitle>
            <CardDescription>
              Update your club information and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Club Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder="Enter your club name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="club_type">Club Type *</Label>
                <Select value={formData.club_type} onValueChange={(value) => handleInputChange("club_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select club type" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.club_type === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="custom_type">Custom Type *</Label>
                  <Input
                    id="custom_type"
                    value={formData.custom_type}
                    onChange={(e) => handleInputChange("custom_type", e.target.value)}
                    required
                    placeholder="Enter custom club type"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your club's mission and activities"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  placeholder="contact@yourclub.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourclub.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange("logo_url", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Club"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/club/${clubId}/dashboard`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ClubEdit;