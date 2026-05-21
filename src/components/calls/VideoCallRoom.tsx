import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  Monitor,
  MonitorOff,
  Settings,
  Users,
  MessageSquare,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  MoreVertical,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  name: string;
  role: "farmer" | "expert" | "merchant" | "admin";
  avatar?: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
}

interface VideoCallRoomProps {
  callType: "video" | "voice";
  participants?: Participant[];
  onEndCall?: () => void;
  expertName?: string;
  expertAvatar?: string;
  topic?: string;
}

// Animated Face Avatar Component with realistic features
const AnimatedFaceAvatar = ({
  name,
  isSpeaking,
  isLarge = false,
  avatarUrl,
}: {
  name: string;
  isSpeaking: boolean;
  isLarge?: boolean;
  avatarUrl?: string;
}) => {
  const [blinkState, setBlinkState] = useState(false);
  const [mouthState, setMouthState] = useState(0);
  const [headTilt, setHeadTilt] = useState(0);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Speaking mouth animation
  useEffect(() => {
    if (isSpeaking) {
      const mouthInterval = setInterval(() => {
        setMouthState(Math.random() * 3);
      }, 100);
      return () => clearInterval(mouthInterval);
    } else {
      setMouthState(0);
    }
  }, [isSpeaking]);

  // Subtle head movement
  useEffect(() => {
    const headInterval = setInterval(() => {
      setHeadTilt((Math.random() - 0.5) * 6);
    }, 2000);
    return () => clearInterval(headInterval);
  }, []);

  // Eye tracking simulation
  useEffect(() => {
    const eyeInterval = setInterval(() => {
      setEyePosition({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2,
      });
    }, 1500);
    return () => clearInterval(eyeInterval);
  }, []);

  const size = isLarge ? "w-full h-full" : "w-32 h-32";
  const faceSize = isLarge ? 200 : 80;

  // Generate consistent color from name
  const getColorFromName = (name: string) => {
    const colors = [
      { skin: "#F5D0C5", hair: "#2C1810", accent: "#FF6B6B" },
      { skin: "#E8C4A8", hair: "#1A1A2E", accent: "#4ECDC4" },
      { skin: "#D4A574", hair: "#16213E", accent: "#FFD93D" },
      { skin: "#C68642", hair: "#0F0E17", accent: "#6BCB77" },
      { skin: "#8D5524", hair: "#1A1A2E", accent: "#FF6B9D" },
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const colors = getColorFromName(name);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-2xl overflow-hidden",
        size,
        isSpeaking && "ring-4 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{
        background: `linear-gradient(135deg, ${colors.accent}20 0%, ${colors.accent}10 100%)`,
      }}
    >
      {/* Animated Face SVG */}
      <motion.svg
        viewBox="0 0 200 200"
        className={isLarge ? "w-4/5 h-4/5" : "w-full h-full"}
        animate={{ rotate: headTilt }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        {/* Face background/head shape */}
        <defs>
          <radialGradient id={`faceGrad-${name}`} cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor={colors.skin} />
            <stop offset="100%" stopColor={`${colors.skin}DD`} />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Hair back */}
        <ellipse
          cx="100"
          cy="70"
          rx="70"
          ry="55"
          fill={colors.hair}
          filter="url(#shadow)"
        />

        {/* Face */}
        <ellipse
          cx="100"
          cy="105"
          rx="55"
          ry="65"
          fill={`url(#faceGrad-${name})`}
          filter="url(#shadow)"
        />

        {/* Ears */}
        <ellipse cx="45" cy="105" rx="8" ry="12" fill={colors.skin} />
        <ellipse cx="155" cy="105" rx="8" ry="12" fill={colors.skin} />

        {/* Hair front */}
        <path
          d={`M 45 80 Q 50 40 100 35 Q 150 40 155 80 Q 140 60 100 55 Q 60 60 45 80`}
          fill={colors.hair}
        />

        {/* Eyebrows */}
        <motion.path
          d="M 65 80 Q 75 75 85 80"
          stroke={colors.hair}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{ y: isSpeaking ? -2 : 0 }}
        />
        <motion.path
          d="M 115 80 Q 125 75 135 80"
          stroke={colors.hair}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          animate={{ y: isSpeaking ? -2 : 0 }}
        />

        {/* Eyes */}
        <g>
          {/* Left eye white */}
          <ellipse cx="75" cy="95" rx="12" ry={blinkState ? 1 : 8} fill="white" />
          {/* Left eye iris */}
          <motion.ellipse
            cx="75"
            cy="95"
            rx="6"
            ry={blinkState ? 0.5 : 6}
            fill="#3A2618"
            animate={{ cx: 75 + eyePosition.x, cy: 95 + eyePosition.y }}
          />
          {/* Left eye pupil */}
          <motion.circle
            cx="75"
            cy="95"
            r={blinkState ? 0.5 : 3}
            fill="#1A0F0A"
            animate={{ cx: 75 + eyePosition.x, cy: 95 + eyePosition.y }}
          />
          {/* Left eye highlight */}
          {!blinkState && (
            <circle cx="77" cy="93" r="2" fill="white" opacity="0.8" />
          )}

          {/* Right eye white */}
          <ellipse cx="125" cy="95" rx="12" ry={blinkState ? 1 : 8} fill="white" />
          {/* Right eye iris */}
          <motion.ellipse
            cx="125"
            cy="95"
            rx="6"
            ry={blinkState ? 0.5 : 6}
            fill="#3A2618"
            animate={{ cx: 125 + eyePosition.x, cy: 95 + eyePosition.y }}
          />
          {/* Right eye pupil */}
          <motion.circle
            cx="125"
            cy="95"
            r={blinkState ? 0.5 : 3}
            fill="#1A0F0A"
            animate={{ cx: 125 + eyePosition.x, cy: 95 + eyePosition.y }}
          />
          {/* Right eye highlight */}
          {!blinkState && (
            <circle cx="127" cy="93" r="2" fill="white" opacity="0.8" />
          )}
        </g>

        {/* Nose */}
        <path
          d="M 100 100 L 95 120 Q 100 125 105 120 L 100 100"
          fill={`${colors.skin}CC`}
          stroke={`${colors.skin}99`}
          strokeWidth="1"
        />

        {/* Mouth */}
        <motion.path
          d={
            mouthState > 2
              ? "M 80 140 Q 100 160 120 140"
              : mouthState > 1
              ? "M 85 140 Q 100 150 115 140"
              : mouthState > 0.5
              ? "M 88 140 Q 100 145 112 140"
              : "M 90 140 Q 100 145 110 140"
          }
          fill={isSpeaking ? "#CC6666" : "none"}
          stroke="#CC6666"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Teeth when speaking */}
        {isSpeaking && mouthState > 1.5 && (
          <rect x="92" y="142" width="16" height="6" rx="2" fill="white" />
        )}

        {/* Cheek blush */}
        <ellipse cx="60" cy="115" rx="10" ry="5" fill="#FFB6C1" opacity="0.3" />
        <ellipse cx="140" cy="115" rx="10" ry="5" fill="#FFB6C1" opacity="0.3" />
      </motion.svg>

      {/* Speaking indicator ring */}
      {isSpeaking && (
        <motion.div
          className="absolute inset-0 rounded-2xl border-4 border-primary"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Name badge */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 text-center">
          <p className="text-sm font-medium truncate">{name}</p>
        </div>
      </div>
    </div>
  );
};

// Video/Voice Call Controls Component
const CallControls = ({
  isMuted,
  isVideoOn,
  isScreenSharing,
  isSpeakerOn,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleSpeaker,
  onEndCall,
  onOpenSettings,
  onOpenChat,
  onOpenParticipants,
  callType,
  isFullscreen,
  onToggleFullscreen,
}: {
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  isSpeakerOn: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleSpeaker: () => void;
  onEndCall: () => void;
  onOpenSettings: () => void;
  onOpenChat: () => void;
  onOpenParticipants: () => void;
  callType: "video" | "voice";
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent"
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
          {/* Mute Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className={cn(
                  "rounded-full w-14 h-14 md:w-16 md:h-16",
                  !isMuted && "bg-muted hover:bg-muted/80"
                )}
                onClick={onToggleMute}
              >
                {isMuted ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isMuted ? "Unmute" : "Mute"}</TooltipContent>
          </Tooltip>

          {/* Video Toggle (only for video calls) */}
          {callType === "video" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={!isVideoOn ? "destructive" : "secondary"}
                  size="lg"
                  className={cn(
                    "rounded-full w-14 h-14 md:w-16 md:h-16",
                    isVideoOn && "bg-muted hover:bg-muted/80"
                  )}
                  onClick={onToggleVideo}
                >
                  {isVideoOn ? (
                    <Video className="h-6 w-6" />
                  ) : (
                    <VideoOff className="h-6 w-6" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isVideoOn ? "Turn off camera" : "Turn on camera"}
              </TooltipContent>
            </Tooltip>
          )}

          {/* Screen Share */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isScreenSharing ? "default" : "secondary"}
                size="lg"
                className={cn(
                  "rounded-full w-14 h-14 md:w-16 md:h-16 hidden md:flex",
                  !isScreenSharing && "bg-muted hover:bg-muted/80"
                )}
                onClick={onToggleScreenShare}
              >
                {isScreenSharing ? (
                  <MonitorOff className="h-6 w-6" />
                ) : (
                  <Monitor className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isScreenSharing ? "Stop sharing" : "Share screen"}
            </TooltipContent>
          </Tooltip>

          {/* Speaker Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-muted hover:bg-muted/80"
                onClick={onToggleSpeaker}
              >
                {isSpeakerOn ? (
                  <Volume2 className="h-6 w-6" />
                ) : (
                  <VolumeX className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSpeakerOn ? "Mute speaker" : "Unmute speaker"}
            </TooltipContent>
          </Tooltip>

          {/* End Call Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16 md:w-20 md:h-20 shadow-lg"
                onClick={onEndCall}
              >
                <PhoneOff className="h-7 w-7 md:h-8 md:w-8" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>End call</TooltipContent>
          </Tooltip>

          {/* Chat Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-muted hover:bg-muted/80 hidden md:flex"
                onClick={onOpenChat}
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chat</TooltipContent>
          </Tooltip>

          {/* Participants Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-muted hover:bg-muted/80"
                onClick={onOpenParticipants}
              >
                <Users className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Participants</TooltipContent>
          </Tooltip>

          {/* Fullscreen Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-14 h-14 md:w-16 md:h-16 bg-muted hover:bg-muted/80 hidden md:flex"
                onClick={onToggleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="h-6 w-6" />
                ) : (
                  <Maximize className="h-6 w-6" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            </TooltipContent>
          </Tooltip>

          {/* More Options (Mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-14 h-14 md:hidden bg-muted hover:bg-muted/80"
              >
                <MoreVertical className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onToggleScreenShare}>
                <Monitor className="h-4 w-4 mr-2" />
                {isScreenSharing ? "Stop sharing" : "Share screen"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleFullscreen}>
                {isFullscreen ? (
                  <Minimize className="h-4 w-4 mr-2" />
                ) : (
                  <Maximize className="h-4 w-4 mr-2" />
                )}
                {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onOpenSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  );
};

// Main VideoCallRoom Component
export const VideoCallRoom = ({
  callType = "video",
  participants: initialParticipants,
  onEndCall,
  expertName = "Dr. Kavita Sharma",
  expertAvatar,
  topic = "Crop Disease Consultation",
}: VideoCallRoomProps) => {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === "video");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState<"good" | "poor">("good");
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default participants
  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants || [
      {
        id: "1",
        name: expertName,
        role: "expert",
        avatar: expertAvatar,
        isSpeaking: false,
        isMuted: false,
        isVideoOn: true,
      },
      {
        id: "2",
        name: "You",
        role: "farmer",
        isSpeaking: false,
        isMuted: false,
        isVideoOn: callType === "video",
      },
    ]
  );

  // Simulate speaking animation
  useEffect(() => {
    if (!isInCall) return;

    const speakingInterval = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          isSpeaking: !p.isMuted && Math.random() > 0.6,
        }))
      );
    }, 800);

    return () => clearInterval(speakingInterval);
  }, [isInCall]);

  // Call duration timer
  useEffect(() => {
    if (!isInCall) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isInCall]);

  // Simulate connection quality changes
  useEffect(() => {
    if (!isInCall) return;

    const qualityInterval = setInterval(() => {
      setConnectionQuality(Math.random() > 0.1 ? "good" : "poor");
    }, 5000);

    return () => clearInterval(qualityInterval);
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleJoinCall = () => {
    setIsInCall(true);
    setCallDuration(0);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallDuration(0);
    onEndCall?.();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Update own participant state
  useEffect(() => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.name === "You"
          ? { ...p, isMuted, isVideoOn }
          : p
      )
    );
  }, [isMuted, isVideoOn]);

  // Pre-call lobby
  if (!isInCall) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary/10 via-background to-accent/10 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <AnimatedFaceAvatar
                    name={expertName}
                    isSpeaking={false}
                    avatarUrl={expertAvatar}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-foreground truncate">
                    {callType === "video" ? "Video" : "Voice"} Call
                  </h2>
                  <p className="text-muted-foreground">{topic}</p>
                  <Badge variant="outline" className="mt-2">
                    with {expertName}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="p-6 space-y-6">
              <div className="aspect-video bg-muted rounded-2xl overflow-hidden relative flex items-center justify-center">
                {callType === "video" && isVideoOn ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                    <AnimatedFaceAvatar
                      name="You"
                      isSpeaking={false}
                      isLarge
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto rounded-full bg-muted-foreground/10 flex items-center justify-center">
                      {callType === "video" ? (
                        <VideoOff className="h-16 w-16 text-muted-foreground" />
                      ) : (
                        <Mic className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {callType === "video"
                        ? "Camera is off"
                        : "Voice call - No camera needed"}
                    </p>
                  </div>
                )}

                {/* Preview controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                  {callType === "video" && (
                    <Button
                      variant={!isVideoOn ? "destructive" : "secondary"}
                      size="icon"
                      className="rounded-full w-12 h-12"
                      onClick={() => setIsVideoOn(!isVideoOn)}
                    >
                      {isVideoOn ? (
                        <Video className="h-5 w-5" />
                      ) : (
                        <VideoOff className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Join Button */}
              <Button
                size="lg"
                className="w-full h-14 text-lg rounded-xl gap-3"
                onClick={handleJoinCall}
              >
                <Phone className="h-6 w-6" />
                Join {callType === "video" ? "Video" : "Voice"} Call
              </Button>

              {/* Tips */}
              <div className="text-sm text-muted-foreground text-center">
                Make sure your microphone and {callType === "video" ? "camera are" : "speakers are"} working properly
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active call view
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-background overflow-hidden"
    >
      {/* Call Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background via-background/95 to-transparent"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Badge
              variant={connectionQuality === "good" ? "default" : "destructive"}
              className="gap-1"
            >
              {connectionQuality === "good" ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {connectionQuality === "good" ? "Good" : "Poor"}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatDuration(callDuration)}
            </div>
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-sm md:text-base">{topic}</h3>
            <p className="text-xs text-muted-foreground">
              {participants.length} participant{participants.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="w-24" /> {/* Spacer for balance */}
        </div>
      </motion.div>

      {/* Main Video Grid */}
      <div className="h-full pt-20 pb-32 px-4">
        <div
          className={cn(
            "h-full max-w-6xl mx-auto grid gap-4",
            participants.length === 1
              ? "grid-cols-1"
              : participants.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : participants.length <= 4
              ? "grid-cols-2"
              : "grid-cols-2 md:grid-cols-3"
          )}
        >
          {participants.map((participant, index) => (
            <motion.div
              key={participant.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative rounded-2xl overflow-hidden bg-muted",
                participant.isSpeaking &&
                  "ring-4 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              {/* Video/Avatar Area */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
                {participant.isVideoOn && callType === "video" ? (
                  <AnimatedFaceAvatar
                    name={participant.name}
                    isSpeaking={participant.isSpeaking}
                    isLarge
                    avatarUrl={participant.avatar}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <AnimatedFaceAvatar
                      name={participant.name}
                      isSpeaking={participant.isSpeaking}
                      isLarge={participants.length <= 2}
                      avatarUrl={participant.avatar}
                    />
                  </div>
                )}
              </div>

              {/* Participant Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/90 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground">
                      {participant.name}
                    </span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {participant.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {participant.isMuted && (
                      <div className="p-1.5 bg-destructive/20 rounded-full">
                        <MicOff className="h-3 w-3 text-destructive" />
                      </div>
                    )}
                    {!participant.isVideoOn && callType === "video" && (
                      <div className="p-1.5 bg-muted rounded-full">
                        <VideoOff className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Speaking Indicator */}
              <AnimatePresence>
                {participant.isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-3 left-3"
                  >
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/90 rounded-full">
                      <div className="flex gap-0.5">
                        {[...Array(3)].map((_, i) => (
                           <motion.div
                             key={i}
                             className="w-1 bg-primary-foreground rounded-full origin-bottom"
                             style={{ height: "12px" }}
                             animate={{
                               scaleY: [0.33, 1, 0.33],
                             }}
                             transition={{
                               duration: 0.5,
                               repeat: Infinity,
                               delay: i * 0.1,
                             }}
                           />
                        ))}
                      </div>
                      <span className="text-xs text-primary-foreground ml-1">
                        Speaking
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call Controls */}
      <CallControls
        isMuted={isMuted}
        isVideoOn={isVideoOn}
        isScreenSharing={isScreenSharing}
        isSpeakerOn={isSpeakerOn}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleVideo={() => setIsVideoOn(!isVideoOn)}
        onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
        onToggleSpeaker={() => setIsSpeakerOn(!isSpeakerOn)}
        onEndCall={handleEndCall}
        onOpenSettings={() => setShowSettings(true)}
        onOpenChat={() => setShowChat(true)}
        onOpenParticipants={() => setShowParticipants(true)}
        callType={callType}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Chat Panel Overlay */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="absolute top-0 right-0 bottom-0 w-full md:w-96 bg-card border-l border-border z-20"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
              >
                Close
              </Button>
            </div>
            <div className="p-4 text-center text-muted-foreground">
              Chat messages will appear here
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participants Panel Overlay */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="absolute top-0 left-0 bottom-0 w-full md:w-80 bg-card border-r border-border z-20"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">
                Participants ({participants.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowParticipants(false)}
              >
                Close
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <Avatar>
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {p.role}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {p.isMuted && <MicOff className="h-4 w-4 text-destructive" />}
                    {!p.isVideoOn && callType === "video" && (
                      <VideoOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoCallRoom;
