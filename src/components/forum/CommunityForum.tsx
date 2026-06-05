import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  Eye, 
  Calendar,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import { LoadingState, ErrorState, EmptyState } from "@/components/state/UIState";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
}

export const CommunityForum = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user } = useCurrentUser();
  const { toast } = useToast();
  
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
  });

  const categories = [
    { value: "crop-management", label: "Crop Management" },
    { value: "pest-control", label: "Pest Control" },
    { value: "fertilizers", label: "Fertilizers" },
    { value: "irrigation", label: "Irrigation" },
    { value: "market-prices", label: "Market Prices" },
    { value: "general-discussion", label: "General Discussion" }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast({ title: "Must be logged in", variant: "destructive" });
      return;
    }
    if (!newPost.title || !newPost.content || !newPost.category) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from('forum_posts').insert({
        user_id: user.id,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category
      });

      if (error) throw error;
      toast({ title: "Post created successfully" });
      setNewPost({ title: "", content: "", category: "" });
      setShowCreatePost(false);
      fetchPosts();
    } catch (err: any) {
      toast({ title: "Failed to create post", description: err.message, variant: "destructive" });
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      "crop-management": { color: "bg-green-100 text-green-800", label: "Crop Management" },
      "pest-control": { color: "bg-red-100 text-red-800", label: "Pest Control" },
      "general-discussion": { color: "bg-gray-100 text-gray-800", label: "General" }
    };
    const config = categoryConfig[category as keyof typeof categoryConfig] || { color: "bg-blue-100 text-blue-800", label: category.replace('-', ' ') };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedPost(null)}>← Back to Forum</Button>
          <h2 className="text-2xl font-bold">Post Details</h2>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{selectedPost.title}</h3>
                <div className="flex items-center gap-2">{getCategoryBadge(selectedPost.category)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(selectedPost.created_at)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{selectedPost.content}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Community Forum</h2>
          <p className="text-muted-foreground">Live Discussions from Supabase</p>
        </div>
        <Button onClick={() => setShowCreatePost(true)}>
          <Plus className="h-4 w-4 mr-2" /> Create Post
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search discussions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {showCreatePost && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={newPost.title} onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newPost.category} onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={newPost.content} onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))} rows={4} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreatePost}>Create Post</Button>
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <LoadingState title="Loading discussions…" />
      ) : error ? (
        <ErrorState title="Could not load posts" description={error} onRetry={fetchPosts} />
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6" onClick={() => setSelectedPost(post)}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg hover:text-primary">{post.title}</h3>
                    {getCategoryBadge(post.category)}
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredPosts.length === 0 && (
            <EmptyState
              title="No posts yet"
              description="Be the first to start a discussion!"
              onRetry={() => setShowCreatePost(true)}
            />
          )}
        </div>
      )}
    </div>
  );
};