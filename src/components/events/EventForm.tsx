
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const EventForm = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [isVirtual, setIsVirtual] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    theme: "classic"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Implement event creation logic here
    toast({
      title: "Event created successfully!",
      description: "Your event page is ready to be shared"
    });
    
    // Redirect to the event page (simulated)
    setTimeout(() => {
      window.location.href = "/my-events";
    }, 1500);
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
              <Label htmlFor="title">Event Title</Label>
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
                <Label htmlFor="location">Location</Label>
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
              <Label>Choose a Theme</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div 
                  className={`border ${formData.theme === 'classic' ? 'border-primary ring-2 ring-primary/30' : 'border-border'} 
                             rounded-lg p-4 cursor-pointer hover:border-primary transition-colors`}
                  onClick={() => setFormData(prev => ({ ...prev, theme: 'classic' }))}
                >
                  <div className="h-32 bg-gradient-to-r from-party-purple/20 to-party-pink/20 rounded-md mb-3 flex items-center justify-center">
                    <span className="font-semibold">Classic</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Simple, elegant design</p>
                </div>
                
                <div 
                  className={`border ${formData.theme === 'celebration' ? 'border-primary ring-2 ring-primary/30' : 'border-border'} 
                             rounded-lg p-4 cursor-pointer hover:border-primary transition-colors`}
                  onClick={() => setFormData(prev => ({ ...prev, theme: 'celebration' }))}
                >
                  <div className="h-32 bg-gradient-to-r from-[#FEC6A1]/30 to-[#FEF7CD]/30 rounded-md mb-3 flex items-center justify-center">
                    <span className="font-semibold">Celebration</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Festive and colorful</p>
                </div>
                
                <div 
                  className={`border ${formData.theme === 'minimalist' ? 'border-primary ring-2 ring-primary/30' : 'border-border'} 
                             rounded-lg p-4 cursor-pointer hover:border-primary transition-colors`}
                  onClick={() => setFormData(prev => ({ ...prev, theme: 'minimalist' }))}
                >
                  <div className="h-32 bg-muted rounded-md mb-3 flex items-center justify-center">
                    <span className="font-semibold">Minimalist</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Clean and modern</p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={handlePrevious}>
                Previous Step
              </Button>
              <Button type="submit">
                Create Event
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EventForm;
