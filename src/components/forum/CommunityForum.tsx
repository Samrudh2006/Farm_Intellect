import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForumPosts } from "@/hooks/useForumPosts";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter, 
  Heart, 
  Eye, 
  Calendar,
  User,
  Send,
  ThumbsUp,
  Reply
} from "lucide-react";

export const CommunityForum = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { posts, loading, error, addPost } = useForumPosts(selectedCategory);
  
  // Create post form state
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: ""
  });

  const categories = [
    { value: "crop-management", label: "Crop Management" },
    { value: "pest-control", label: "Pest Control" },
    { value: "fertilizers", label: "Fertilizers" },
    { value: "irrigation", label: "Irrigation" },
    { value: "market-prices", label: "Market Prices" },
    { value: "weather", label: "Weather" },
    { value: "government-schemes", label: "Government Schemes" },
    { value: "general-discussion", label: "General Discussion" }
  ];

  const handleCreatePost = () => {
    if (!newPost.title || !newPost.content || !newPost.category) {
      return;
    }

    addPost({
      title: newPost.title,
      content: newPost.content,
      category: newPost.category || undefined,
      user_id: "current-user",
      upvotes: 0,
      views: 0
    });
    
    setNewPost({ title: "", content: "", category: "" });
    setShowCreatePost(false);
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      "crop-management": { color: "bg-green-100 text-green-800", label: "Crop Management" },
      "pest-control": { color: "bg-red-100 text-red-800", label: "Pest Control" },
      "fertilizers": { color: "bg-blue-100 text-blue-800", label: "Fertilizers" },
      "irrigation": { color: "bg-cyan-100 text-cyan-800", label: "Irrigation" },
      "market-prices": { color: "bg-yellow-100 text-yellow-800", label: "Market Prices" },
      "weather": { color: "bg-purple-100 text-purple-800", label: "Weather" },
      "government-schemes": { color: "bg-orange-100 text-orange-800", label: "Gov Schemes" },
      "general-discussion": { color: "bg-gray-100 text-gray-800", label: "General" }
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig["general-discussion"];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      "Expert": "bg-purple-100 text-purple-800",
      "Farmer": "bg-green-100 text-green-800",
      "Merchant": "bg-blue-100 text-blue-800",
      "Admin": "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}>
        {role}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedPost(null)}>
            ← Back to Forum
          </Button>
          <h2 className="text-2xl font-bold">Post Details</h2>
        </div>

        {/* Post Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{selectedPost.title}</h3>
                <div className="flex items-center gap-2">
                  {getCategoryBadge(selectedPost.category)}
                  {selectedPost.tags.map(tag => (
                    <Badge key={tag} variant="outline">#{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{selectedPost.author.name}</span>
                {getRoleBadge(selectedPost.author.role)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(selectedPost.createdAt)}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-muted-foreground mb-4">{selectedPost.content}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" />
                <span>{selectedPost.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{selectedPost.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{selectedPost.comments} comments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments - Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Comments (Coming Soon)</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Comment functionality will be available soon</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Community Forum</h2>
          <p className="text-muted-foreground">
            Connect with fellow farmers, experts, and agricultural professionals
          </p>
        </div>
        <Button onClick={() => setShowCreatePost(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Post Modal */}
      {showCreatePost && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            <CardDescription>Share your question or experience with the community</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter post title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newPost.category} onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Describe your question or share your experience..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., wheat, organic, fertilizer"
                value={newPost.tags}
                onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleCreatePost}>Create Post</Button>
              <Button variant="outline" onClick={() => setShowCreatePost(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading forum posts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          Error loading posts: {error}
        </div>
      )}

      {/* Posts List */}
      {!loading && !error && (
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
                
                <div className="flex items-center gap-2">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="outline">#{tag}</Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{post.author.name}</span>
                      {getRoleBadge(post.author.role)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredPosts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to start a discussion in this category!
              </p>
              <Button onClick={() => setShowCreatePost(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
