import { useState } from "react";
import Turnstile from "react-turnstile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const categories = ["Crop Disease", "Soil Health", "Irrigation", "Pest Control", "Fertilizer", "Market Advice", "General"];
const priorities = ["low", "medium", "high"];

export const FarmerConsultationForm = ({ onSubmitted }: { onSubmitted?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !title.trim() || !description.trim()) return;
    if (!captchaToken) {
      toast({ title: "Verification required", description: "Please complete the CAPTCHA", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("consultations").insert({
      farmer_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      captcha_verified: true,
    });

    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Consultation submitted!", description: "An expert will review your request soon." });
      setTitle("");
      setDescription("");
      setCategory("General");
      setPriority("medium");
      setCaptchaToken(null);
      onSubmitted?.();
    }
    setSubmitting(false);
  };

  return (
    <Card className="tricolor-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Ask an Expert
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consult-title">Question Title</Label>
            <Input id="consult-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Yellow spots on wheat leaves" maxLength={200} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consult-desc">Describe your issue</Label>
            <Textarea id="consult-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide details about your crop issue, soil condition, or any agricultural question…" rows={4} maxLength={2000} required />
          </div>

          {/* Turnstile CAPTCHA for bot prevention */}
          <div className="flex justify-center py-2">
            <Turnstile
              sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ""}
              onSuccess={(token) => setCaptchaToken(token)}
              onError={() => {
                setCaptchaToken(null);
                toast({ title: "CAPTCHA failed", description: "Please try again", variant: "destructive" });
              }}
              theme="light"
            />
          </div>

          <Button type="submit" disabled={submitting || !captchaToken} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Submitting…" : "Submit to Expert Queue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
