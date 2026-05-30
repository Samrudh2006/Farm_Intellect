import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, BookOpen, Video, ExternalLink, Headphones, Image, FileText, Pause, Download } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const KnowledgeHub = () => {
  const [playingPodcast, setPlayingPodcast] = useState<string | null>(null);

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
    },
    {
      id: 2,
      title: "Organic Pest Control (जैविक कीट नियंत्रण)",
      description: "Natural methods to control pests without chemicals",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: "8:45",
      category: "Pest Control"
    },
    {
      id: 3,
      title: "Drip Irrigation Setup (ड्रिप सिंचाई)",
      description: "How to install and maintain drip irrigation system",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      duration: "15:20",
      category: "Irrigation"
    }
  ];

  const togglePodcast = (podcastId: string, audioSrc: string) => {
    const audio = document.getElementById(podcastId) as HTMLAudioElement;
    if (playingPodcast === podcastId) {
      audio?.pause();
      setPlayingPodcast(null);
    } else {
      // Pause any currently playing podcast
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
            Learn from expert farmers and agricultural scientists through podcasts, infographics, slides, and videos
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="podcasts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
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

        {/* Podcasts Tab */}
        <TabsContent value="podcasts" className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            AI-Generated Podcasts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {podcasts.map((podcast) => (
              <Card key={podcast.id} className="group hover:shadow-lg transition-all border-2 hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div 
                      className={`p-4 rounded-full cursor-pointer transition-all ${
                        playingPodcast === podcast.id 
                          ? 'bg-primary text-primary-foreground animate-pulse' 
                          : 'bg-primary/10 hover:bg-primary/20'
                      }`}
                      onClick={() => togglePodcast(podcast.id, podcast.src)}
                    >
                      {playingPodcast === podcast.id ? (
                        <Pause className="h-8 w-8" />
                      ) : (
                        <PlayCircle className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
                          {podcast.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{podcast.duration}</span>
                      </div>
                      <h4 className="font-semibold mb-2">{podcast.title}</h4>
                      <p className="text-sm text-muted-foreground">{podcast.description}</p>
                    </div>
                  </div>
                  <audio id={podcast.id} src={podcast.src} onEnded={() => setPlayingPodcast(null)} />
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => togglePodcast(podcast.id, podcast.src)}
                    >
                      {playingPodcast === podcast.id ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Listen Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Infographics Tab */}
        <TabsContent value="infographics" className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            Visual Guides & Infographics
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {infographics.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={item.src} 
                    alt={item.title}
                    className="w-full h-auto object-contain cursor-pointer"
                    onClick={() => window.open(item.src, '_blank')}
                  />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    {item.category}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(item.src, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Size
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Slides Tab */}
        <TabsContent value="slides" className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Presentation Slides
          </h3>
          <div className="grid grid-cols-1 gap-6">
            {slides.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-4 rounded-lg bg-red-500/10">
                      <FileText className="h-12 w-12 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.pages} pages</span>
                      </div>
                      <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                      <div className="flex gap-2">
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={() => window.open(item.src, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View PDF
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={item.src} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Educational Videos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative">
                  <AspectRatio ratio={16 / 9}>
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </AspectRatio>
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg">
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-gray-100"
                      onClick={() => window.open(video.url, '_blank')}
                    >
                      <PlayCircle className="h-6 w-6 mr-2" />
                      Watch Now
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                    {video.category}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2 line-clamp-2">{video.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={() => window.open(video.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Watch on YouTube
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Community Links */}
      <Card>
        <CardHeader>
          <CardTitle>Join Farming Communities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('https://t.me/farmer_community', '_blank')}
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.82-.896 6.728-.896 6.728-.896 6.728-1.292 1.299-1.292 1.299s-.462-.47-1.187-.796c-.725-.326-1.615-.592-1.615-.592s-1.33-.557-1.813-1.002c-.483-.445-.484-.942-.244-1.615.24-.673.72-1.487.72-1.487s2.17-2.085 2.915-2.587c.745-.502 1.38-.44 1.38-.44s.49-.042.633.203c.143.245.123.576-.243.8-.366.224-2.678 1.733-2.678 1.733l-.004.003s-.317.24-.604.04c-.287-.2-1.156-.8-1.156-.8s-.936-.6-1.037-.635c-.101-.035-.257-.123-.165-.52.092-.397.594-1.084.594-1.084s3.417-3.407 4.232-3.926c.815-.519 1.484-.404 1.484-.404s.508-.017.787.18c.279.197.332.5.088.837z"/>
            </svg>
            Join Telegram Group - Punjab Farmers
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => window.open('https://wa.me/+919876543210', '_blank')}
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp Expert Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
