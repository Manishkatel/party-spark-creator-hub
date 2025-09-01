
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EventFormProps {
  clubs: any[];
  user: any;
}

const EventForm = ({ clubs, user }: EventFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    max_attendees: "",
    club_id: "",
    additional_info: ""
  });
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.title) {
      toast({
        title: "Event title is required",
        description: "Please add a title for your event",
        variant: "destructive"
      });
      return;
    }
    
    if (step === 2 && !date) {
      toast({
        title: "Date is required",
        description: "Please select a date for your event",
        variant: "destructive"
      });
      return;
    }

    setStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !formData.club_id) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Combine date and time
    const eventDateTime = new Date(date);
    const [hours, minutes] = time.split(':');
    eventDateTime.setHours(parseInt(hours), parseInt(minutes));

    const { error } = await supabase
      .from('events')
      .insert({
        title: formData.title,
        description: formData.description,
        event_date: eventDateTime.toISOString(),
        location: isVirtual ? 'Virtual Event' : formData.location,
        price: formData.price ? parseFloat(formData.price) : 0,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        club_id: formData.club_id,
        created_by: user.user_id,
        additional_info: formData.additional_info
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Event created successfully!",
        description: "Your event is now live"
      });
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create your event</h1>
        <p className="text-muted-foreground">Fill out the details for your event below.</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary" : "bg-muted"}`}>
            <span className={step >= 1 ? "text-white" : "text-muted-foreground"}>1</span>
          </div>
          <div className={`h-1 flex-grow mx-2 ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary" : "bg-muted"}`}>
            <span className={step >= 2 ? "text-white" : "text-muted-foreground"}>2</span>
          </div>
          <div className={`h-1 flex-grow mx-2 ${step >= 3 ? "bg-primary" : "bg-muted"}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary" : "bg-muted"}`}>
            <span className={step >= 3 ? "text-white" : "text-muted-foreground"}>3</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="club_id">Select Club *</Label>
              <Select value={formData.club_id} onValueChange={(value) => setFormData(prev => ({ ...prev, club_id: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a club" />
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

            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Summer BBQ Party"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Join us for a fun summer BBQ with games, food, and more!"
                className="mt-1 min-h-32"
              />
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="button" onClick={handleNext}>
                Next Step
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label>Event Date</Label>
              <div className="mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div>
              <Label htmlFor="time">Event Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                id="virtual"
                checked={isVirtual}
                onCheckedChange={() => setIsVirtual(!isVirtual)}
              />
              <Label htmlFor="virtual">This is a virtual event</Label>
            </div>
            
            {!isVirtual && (
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="123 Party St, Funtown"
                  className="mt-1"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="max_attendees">Max Attendees</Label>
                <Input
                  id="max_attendees"
                  name="max_attendees"
                  type="number"
                  min="1"
                  value={formData.max_attendees}
                  onChange={handleChange}
                  placeholder="Unlimited"
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Previous Step
              </Button>
              <Button type="button" onClick={handleNext}>
                Next Step
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="additional_info">Additional Information</Label>
              <Textarea
                id="additional_info"
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                placeholder="Any additional details about the event..."
                className="mt-1 min-h-32"
              />
            </div>
            
            <div className="pt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Previous Step
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating Event..." : "Create Event"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EventForm;
