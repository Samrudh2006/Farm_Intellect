import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePolls } from "@/hooks/usePolls";
import {
  Calendar,
  CheckCircle,
  Clock,
  MessageCircle,
  Plus,
  TrendingUp,
  Users,
  Vote,
  Wheat
} from "lucide-react";

const Polls = () => {
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const { polls, loading, error, voteOnPoll } = usePolls();
  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    category: 'crop_selection',
    options: ['', ''],
    endDate: ''
  });

  const user = {
    name: "John Farmer",
    role: "farmer",
  };

  const categoryColors = {
    crop_selection: "bg-green-100 text-green-700",
    pricing: "bg-blue-100 text-blue-700",
    technique: "bg-purple-100 text-purple-700",
    market_trend: "bg-orange-100 text-orange-700",
  };

  const categoryIcons = {
    crop_selection: Wheat,
    pricing: TrendingUp,
    technique: CheckCircle,
    market_trend: MessageCircle,
  };

  const statusColors = {
    active: "default",
    completed: "secondary",
    upcoming: "outline",
  };

  const handleVote = (_pollId: string, _optionId: string) => {
    // In real app, this would update the vote in backend
  };

  const handleCreatePoll = () => {
    setShowCreatePoll(false);
    // Reset form
    setNewPoll({
      title: '',
      description: '',
      category: 'crop_selection',
      options: ['', ''],
      endDate: ''
    });
  };

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll({
        ...newPoll,
        options: [...newPoll.options, '']
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newPoll.options];
    updatedOptions[index] = value;
    setNewPoll({
      ...newPoll,
      options: updatedOptions
    });
  };

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const updatedOptions = newPoll.options.filter((_, i) => i !== index);
      setNewPoll({
        ...newPoll,
        options: updatedOptions
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        notificationCount={3}
      />
      
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={user.role}
      />

      <main className="md:ml-64 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Community Polls</h2>
              <p className="text-muted-foreground">
                Participate in agricultural discussions and community decisions
              </p>
            </div>
            <Button onClick={() => setShowCreatePoll(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </div>

          {showCreatePoll && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Poll</CardTitle>
                <CardDescription>
                  Start a discussion with the farming community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Poll Title</Label>
                  <Input
                    id="title"
                    value={newPoll.title}
                    onChange={(e) => setNewPoll({...newPoll, title: e.target.value})}
                    placeholder="Enter poll title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newPoll.description}
                    onChange={(e) => setNewPoll({...newPoll, description: e.target.value})}
                    placeholder="Describe what this poll is about"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {newPoll.options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {newPoll.options.length > 2 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  {newPoll.options.length < 6 && (
                    <Button variant="outline" onClick={addOption}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleCreatePoll}>Create Poll</Button>
                  <Button variant="outline" onClick={() => setShowCreatePoll(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">Active Polls</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="my-polls">My Polls</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                  <p className="text-muted-foreground mt-4">Loading polls...</p>
                </div>
              )}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
                  Error loading polls: {error}
                </div>
              )}
              {!loading && !error && (
                <div className="grid gap-6">
                  {polls.map((poll) => {
                  const CategoryIcon = categoryIcons[poll.category];
                  
                  return (
                    <Card key={poll.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={categoryColors[poll.category]}>
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {poll.category.replace('_', ' ')}
                              </Badge>
                              <Badge variant={statusColors[poll.status] as any}>
                                {poll.status}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl">{poll.title}</CardTitle>
                            <CardDescription>{poll.description}</CardDescription>
                          </div>
                          
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 mb-1">
                              <Users className="h-4 w-4" />
                              {poll.totalVotes} votes
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Ends {poll.endDate}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          By {poll.creator} • {poll.region}
                        </div>

                        <div className="space-y-3">
                          {poll.options.map((option) => (
                            <div key={option.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {poll.userVoted === option.id ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleVote(poll.id, option.id)}
                                      disabled={!!poll.userVoted}
                                    >
                                      <Vote className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <span className={poll.userVoted === option.id ? 'font-medium text-green-600' : ''}>
                                    {option.text}
                                  </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {option.percentage}% ({option.votes})
                                </span>
                              </div>
                              <Progress value={option.percentage} className="h-2" />
                            </div>
                          ))}
                        </div>

                        {poll.userVoted && (
                          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <CheckCircle className="h-4 w-4" />
                              Thank you for voting! Results will be available after the poll ends.
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">Completed polls coming soon</p>
              </div>
              {/* Removed: mockPolls.filter(poll => poll.status === 'completed').map((poll) => {
                  const CategoryIcon = categoryIcons[poll.category];
                  const winningOption = poll.options.reduce((prev, current) => 
                    prev.votes > current.votes ? prev : current
                  );
                  
                  return (
                    <Card key={poll.id} className="opacity-90">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={categoryColors[poll.category]}>
                                <CategoryIcon className="h-3 w-3 mr-1" />
                                {poll.category.replace('_', ' ')}
                              </Badge>
                              <Badge variant="secondary">Completed</Badge>
                            </div>
                            <CardTitle className="text-xl">{poll.title}</CardTitle>
                            <CardDescription>{poll.description}</CardDescription>
                          </div>
                          
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 mb-1">
                              <Users className="h-4 w-4" />
                              {poll.totalVotes} votes
                            </div>
                            <div>Ended {poll.endDate}</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-center gap-2 text-sm text-blue-700">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-medium">Winner: {winningOption.text}</span>
                            <span>({winningOption.percentage}% of votes)</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {poll.options.map((option) => (
                            <div key={option.id} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className={option.id === winningOption.id ? 'font-medium' : ''}>
                                  {option.text}
                                </span>
                                <span>{option.percentage}% ({option.votes})</span>
                              </div>
                              <Progress value={option.percentage} className="h-1.5" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="my-polls">
              <Card className="text-center py-12">
                <CardContent>
                  <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No polls created yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start engaging with the community by creating your first poll
                  </p>
                  <Button onClick={() => setShowCreatePoll(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Poll
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Polls;
