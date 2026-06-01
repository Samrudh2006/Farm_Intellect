import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  MessageCircle,
  Plus,
  Users,
  Vote,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  created_at: string;
  creator_id: string;
}

const Polls = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollOptions, setNewPollOptions] = useState<string[]>(["", ""]);
  
  const { user } = useCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPolls(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!user) {
      toast({ title: "Must be logged in", variant: "destructive" });
      return;
    }
    const validOptions = newPollOptions.filter(o => o.trim() !== "");
    if (!newPollTitle || validOptions.length < 2) {
      toast({ title: "Provide a question and at least 2 options", variant: "destructive" });
      return;
    }

    const optionsObj = validOptions.map((opt, i) => ({
      id: `opt_${i}`,
      text: opt,
      votes: 0
    }));

    try {
      const { error } = await supabase.from('polls').insert({
        creator_id: user.id,
        question: newPollTitle,
        options: optionsObj
      });

      if (error) throw error;
      toast({ title: "Poll created successfully!" });
      setShowCreatePoll(false);
      setNewPollTitle("");
      setNewPollOptions(["", ""]);
      fetchPolls();
    } catch (err: any) {
      toast({ title: "Error creating poll", description: err.message, variant: "destructive" });
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    
    const updatedOptions = poll.options.map(opt => {
      if (opt.id === optionId) {
        return { ...opt, votes: opt.votes + 1 };
      }
      return opt;
    });

    try {
      const { error } = await supabase
        .from('polls')
        .update({ options: updatedOptions })
        .eq('id', pollId);

      if (error) throw error;
      toast({ title: "Vote recorded!" });
      fetchPolls();
    } catch (err: any) {
      toast({ title: "Error voting", description: err.message, variant: "destructive" });
    }
  };

  const addOption = () => {
    if (newPollOptions.length < 6) {
      setNewPollOptions([...newPollOptions, ""]);
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...newPollOptions];
    updated[index] = value;
    setNewPollOptions(updated);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} notificationCount={3} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole={user?.role || "farmer"} />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Community Polls</h2>
              <p className="text-muted-foreground">Live Data from Supabase</p>
            </div>
            <Button onClick={() => setShowCreatePoll(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Poll
            </Button>
          </div>

          {showCreatePoll && (
            <Card>
              <CardHeader><CardTitle>Create New Poll</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input value={newPollTitle} onChange={(e) => setNewPollTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  {newPollOptions.map((opt, i) => (
                    <Input key={i} className="mb-2" value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                  ))}
                  {newPollOptions.length < 6 && <Button variant="outline" onClick={addOption}>Add Option</Button>}
                </div>
                <div className="flex gap-4 pt-4">
                  <Button onClick={handleCreatePoll}>Create Poll</Button>
                  <Button variant="outline" onClick={() => setShowCreatePoll(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Polls</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : polls.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No polls created yet</h3>
                    <Button onClick={() => setShowCreatePoll(true)}><Plus className="h-4 w-4 mr-2" /> Create Your First Poll</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {polls.map((poll) => {
                    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                    
                    return (
                      <Card key={poll.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <CardTitle className="text-xl">{poll.question}</CardTitle>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <div className="flex items-center gap-1 mb-1">
                                <Users className="h-4 w-4" /> {totalVotes} votes
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            {poll.options.map((option) => {
                              const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
                              return (
                                <div key={option.id} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="sm" onClick={() => handleVote(poll.id, option.id)}>
                                        <Vote className="h-4 w-4" />
                                      </Button>
                                      <span>{option.text}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{percentage}% ({option.votes})</span>
                                  </div>
                                  <Progress value={percentage} className="h-2" />
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Polls;