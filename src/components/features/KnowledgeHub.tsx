import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, BookOpen, Video, ExternalLink, Headphones, Image, FileText, Pause, Download, BookText, Loader2 } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
}

export const KnowledgeHub = () => {
  const [playingPodcast, setPlayingPodcast] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('knowledge_articles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setArticles(data);
        }
      } catch (err) {
        console.error("Failed to fetch articles:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  const podcasts = [
    {
      id: "podcast-1",
      title: "Farm Intellect Boosts Yields",
      description: "Learn how AI-powered advisory systems help farmers increase crop yields through data-driven decisions",
      src: "/knowledge/podcasts/smart-crop-advisory-yields.m4a",
      duration: "~5 min",
      category: "AI Advisory"
    },
    {
      id: "podcast-2",
      title: "AI Plant Diagnosis & Market Alerts",
      description: "Discover how machine learning identifies plant diseases and provides real-time market intelligence",
      src: "/knowledge/podcasts/ai-plant-diagnosis-market.m4a",
      duration: "~5 min",
      category: "Disease Detection"
    }
  ];

  const infographics = [
    {
      id: "infographic-1",
      title: "Farm Intellect: Revolutionizing Agriculture",
      description: "Complete overview of AI-powered farming - from challenges to solutions, technology architecture, and future roadmap",
      src: "/knowledge/infographics/smart-crop-advisory.png",
      category: "Platform Overview"
    }
  ];

  const slides = [
    {
      id: "slides-1",
      title: "Smart Crop Intelligence - Executive Explainer",
      description: "Comprehensive presentation covering platform concept, features, architecture, and implementation roadmap",
      src: "/knowledge/slides/smart-crop-intelligence.pdf",
      pages: 12,
      category: "Project Overview"
    }
  ];

  const videos = [
    {
      id: 1,
      title: "Wheat Farming Best Practices (गेहूं की खेती)",
      description: "Learn modern techniques for wheat cultivation",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: "12:30",
      category: "Crops"
    }
  ];

  const togglePodcast = (podcastId: string, audioSrc: string) => {
    const audio = document.getElementById(podcastId) as HTMLAudioElement;
    if (playingPodcast === podcastId) {
      audio?.pause();
      setPlayingPodcast(null);
    } else {
      if (playingPodcast) {
        const currentAudio = document.getElementById(playingPodcast) as HTMLAudioElement;
        currentAudio?.pause();
      }
      audio?.play();
      setPlayingPodcast(podcastId);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 via-background to-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Knowledge Hub (ज्ञान केंद्र)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Learn from expert farmers and agricultural scientists through articles, podcasts, and videos.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <BookText className="h-4 w-4" />
            <span className="hidden sm:inline">Articles</span>
          </TabsTrigger>
          <TabsTrigger value="podcasts" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            <span className="hidden sm:inline">Podcasts</span>
          </TabsTrigger>
          <TabsTrigger value="infographics" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Infographics</span>
          </TabsTrigger>
          <TabsTrigger value="slides" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Slides</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
        </TabsList>

        {/* Live Database Articles Tab */}
        <TabsContent value="articles" className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BookText className="h-5 w-5 text-primary" />
            Expert Articles (Live from Supabase)
          </h3>
          
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : articles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground space-y-3">
                <p>No articles found in the database. Did you run the seed script?</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-all border border-primary/20">
                  {article.image_url && (
                    <div className="w-full h-48 bg-muted">
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium uppercase tracking-wider mb-3 inline-block">
                      {article.category.replace('_', ' ')}
                    </span>
                    <h4 className="text-lg font-bold mb-2 line-clamp-2">{article.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {article.content}
                    </p>
                    <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary hover:text-white transition-colors">
                      Read Full Article
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Podcasts Tab */}
        <TabsContent value="podcasts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {podcasts.map((podcast) => (
              <Card key={podcast.id} className="group hover:shadow-lg transition-all border-2 hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className={`p-4 rounded-full cursor-pointer transition-all ${
                        playingPodcast === podcast.id ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-primary/10 hover:bg-primary/20'
                      }`}
                      onClick={() => togglePodcast(podcast.id, podcast.src)}
                    >
                      {playingPodcast === podcast.id ? <Pause className="h-8 w-8" /> : <PlayCircle className="h-8 w-8 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{podcast.title}</h4>
                      <p className="text-sm text-muted-foreground">{podcast.description}</p>
                    </div>
                  </div>
                  <audio id={podcast.id} src={podcast.src} onEnded={() => setPlayingPodcast(null)} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Infographics Tab */}
        <TabsContent value="infographics" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {infographics.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative">
                  <img src={item.src} alt={item.title} className="w-full h-auto object-contain cursor-pointer" onClick={() => window.open(item.src, '_blank')}/>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Slides Tab */}
        <TabsContent value="slides" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {slides.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                  <Button variant="outline" size="sm" onClick={() => window.open(item.src, '_blank')}>View PDF</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id}>
                <div className="relative">
                  <AspectRatio ratio={16 / 9}>
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover rounded-t-lg"/>
                  </AspectRatio>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 line-clamp-2">{video.title}</h4>
                  <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => window.open(video.url, '_blank')}>Watch on YouTube</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
