import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Edit, Trash2, Eye, Send, FileText } from "lucide-react";
import { supabase, hasSupabaseEnv } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const categories = ["General", "Crop Disease", "Soil Health", "Irrigation", "Pest Control", "Fertilizer", "Market Advice", "Weather", "Government Schemes"];

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  status: string;
  published_at: string | null;
  created_at: string;
  author_id: string;
}

const DEFAULT_MOCK_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "Understanding Soil pH for Better Yields",
    content: "Soil pH is a crucial factor in crop production as it directly affects nutrient availability. Most crops prefer a slightly acidic to neutral pH (6.0 - 7.0). If your soil is too acidic, you can add lime. If it's too alkaline, elemental sulfur can help lower the pH.",
    category: "Soil Health",
    tags: ["soil", "pH", "nutrients"],
    status: "published",
    published_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    author_id: "mock-expert-1"
  },
  {
    id: "art-2",
    title: "Managing Fall Armyworm in Maize",
    content: "Early detection is key to controlling Fall Armyworm (FAW). Look for window-pane damage on leaves. For chemical control, use recommended insecticides when 5-10% of plants are infested. Biological controls like Trichogramma wasps can also be effective.",
    category: "Pest Control",
    tags: ["maize", "pests", "FAW"],
    status: "draft",
    published_at: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    author_id: "mock-expert-1"
  }
];

const ExpertKnowledgeHub = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user: authUser } = useAuth();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      if (!hasSupabaseEnv) {
        let stored = localStorage.getItem("mock_knowledge_articles");
        if (!stored) {
          localStorage.setItem("mock_knowledge_articles", JSON.stringify(DEFAULT_MOCK_ARTICLES));
          stored = JSON.stringify(DEFAULT_MOCK_ARTICLES);
        }
        setArticles(JSON.parse(stored));
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase.from("knowledge_articles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.warn("Failed to fetch articles:", err);
      if (!hasSupabaseEnv) {
        setArticles(DEFAULT_MOCK_ARTICLES);
      } else {
        setArticles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const resetForm = () => {
    setTitle(""); setContent(""); setCategory("General"); setTagsInput(""); setEditingId(null);
  };

  const openEdit = (a: Article) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setCategory(a.category);
    setTagsInput((a.tags || []).join(", "));
    setDialogOpen(true);
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    const payload: any = {
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      status: publish ? "published" : "draft",
      ...(publish ? { published_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    };

    if (!hasSupabaseEnv) {
      let updatedArticles = [...articles];
      if (editingId) {
        updatedArticles = updatedArticles.map(a => a.id === editingId ? { ...a, ...payload } : a);
        toast({ title: publish ? "Article published (Mock)!" : "Draft saved (Mock)" });
      } else {
        payload.id = `art-${Date.now()}`;
        payload.author_id = authUser?.id || "mock-expert-1";
        payload.created_at = new Date().toISOString();
        updatedArticles = [payload, ...updatedArticles];
        toast({ title: publish ? "Article published (Mock)!" : "Draft created (Mock)" });
      }
      localStorage.setItem("mock_knowledge_articles", JSON.stringify(updatedArticles));
      setArticles(updatedArticles);
      setSaving(false);
      setDialogOpen(false);
      resetForm();
      return;
    }

    if (!authUser?.id) {
      setSaving(false);
      return;
    }

    if (editingId) {
      await supabase.from("knowledge_articles").update(payload).eq("id", editingId);
      toast({ title: publish ? "Article published!" : "Draft saved" });
    } else {
      payload.author_id = authUser.id;
      await supabase.from("knowledge_articles").insert(payload);
      toast({ title: publish ? "Article published!" : "Draft created" });
    }
    setSaving(false);
    setDialogOpen(false);
    resetForm();
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    if (!hasSupabaseEnv) {
      const updated = articles.filter(a => a.id !== id);
      localStorage.setItem("mock_knowledge_articles", JSON.stringify(updated));
      setArticles(updated);
      toast({ title: "Article deleted (Mock)" });
      return;
    }

    await supabase.from("knowledge_articles").delete().eq("id", id);
    toast({ title: "Article deleted" });
    fetchArticles();
  };

  const handlePublishToggle = async (a: Article) => {
    const newStatus = a.status === "published" ? "draft" : "published";
    const publishedAt = newStatus === "published" ? new Date().toISOString() : null;

    if (!hasSupabaseEnv) {
      const updated = articles.map(art => art.id === a.id ? { ...art, status: newStatus, published_at: publishedAt, updated_at: new Date().toISOString() } : art);
      localStorage.setItem("mock_knowledge_articles", JSON.stringify(updated));
      setArticles(updated);
      toast({ title: newStatus === "published" ? "Published (Mock)!" : "Unpublished (Mock)" });
      return;
    }

    await supabase.from("knowledge_articles").update({
      status: newStatus,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    }).eq("id", a.id);
    toast({ title: newStatus === "published" ? "Published!" : "Unpublished" });
    fetchArticles();
  };

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === "published").length,
    drafts: articles.filter(a => a.status === "draft").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: user.name, role: "expert" }} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userRole="expert" />
      <main className="md:ml-64 pt-16 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gradient-tricolor">📚 Knowledge Hub</h1>
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> New Article</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Article" : "Write New Article"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title" maxLength={300} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma-separated)</Label>
                      <Input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="wheat, rabi, tips" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your expert knowledge article..." rows={10} maxLength={10000} required />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                      <FileText className="h-4 w-4 mr-2" /> Save Draft
                    </Button>
                    <Button onClick={() => handleSave(true)} disabled={saving}>
                      <Send className="h-4 w-4 mr-2" /> Publish
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total", value: stats.total, color: "primary" },
              { label: "Published", value: stats.published, color: "primary" },
              { label: "Drafts", value: stats.drafts, color: "accent" },
            ].map((s, i) => (
              <Card key={i} className="tricolor-card">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Articles List */}
          <Card className="tricolor-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Your Articles</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full mb-3" />)
              ) : articles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
                  <p>No articles yet. Write your first one!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {articles.map(a => (
                    <div key={a.id} className="py-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{a.title}</span>
                          <Badge variant={a.status === "published" ? "default" : "secondary"}>{a.status}</Badge>
                          <Badge variant="outline">{a.category}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{format(new Date(a.created_at), "MMM dd, yyyy")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                      {a.tags && a.tags.length > 0 && (
                        <div className="flex gap-1">{a.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(a)}><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                        <Button size="sm" variant="outline" onClick={() => handlePublishToggle(a)}>
                          <Eye className="h-3 w-3 mr-1" /> {a.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ExpertKnowledgeHub;
