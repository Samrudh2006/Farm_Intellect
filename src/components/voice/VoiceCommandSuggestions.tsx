import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

interface VoiceCommandSuggestionsProps {
  currentRoute: string;
  onSuggestedCommandClick?: (command: string) => void;
  minimal?: boolean;
}

/**
 * Context-aware voice command suggestions
 * Shows relevant commands based on current page
 */
const fetchSuggestionsApi = async (currentRoute: string) => {
  return apiFetch<{ suggestions: string[] }>(
    `/api/commands/suggestions?currentRoute=${encodeURIComponent(currentRoute)}`
  );
};

export const VoiceCommandSuggestions: React.FC<VoiceCommandSuggestionsProps> = ({
  currentRoute,
  onSuggestedCommandClick,
  minimal = false,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchSuggestions = async () => {
      try {
        const data = await fetchSuggestionsApi(currentRoute);
        if (active) {
          setSuggestions(data.suggestions || []);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch suggestions:', error);
        if (active) {
          setSuggestions(getDefaultSuggestions(currentRoute));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSuggestions();
    
    return () => {
      active = false;
    };
  }, [currentRoute]);

  const handleCommandClick = (command: string) => {
    if (onSuggestedCommandClick) {
      onSuggestedCommandClick(command);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-20 bg-muted rounded-full animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  if (minimal) {
    return (
      <div className="flex gap-2 flex-wrap">
        {suggestions.slice(0, 3).map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            onClick={() => handleCommandClick(suggestion)}
            className="text-xs"
          >
            <Command className="h-3 w-3 mr-1" />
            {suggestion}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Zap className="h-4 w-4" />
        Suggested Commands
      </div>

      <div className="grid grid-cols-2 gap-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            onClick={() => handleCommandClick(suggestion)}
            className="justify-start text-xs h-8"
          >
            <Command className="h-3 w-3 mr-1" />
            {suggestion}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};

function getDefaultSuggestions(route: string): string[] {
  const suggestions: Record<string, string[]> = {
    '/farmer/crops': [
      'Show my crops',
      'Add new crop',
      'Crop details',
    ],
    '/farmer/advisory': [
      'Get advisory',
      'Show advisories',
      'Latest advice',
    ],
    '/farmer/weather': [
      'Show weather',
      'Weather forecast',
      'Rain prediction',
    ],
    '/farmer/dashboard': [
      'Go to crops',
      'Show weather',
      'View advisory',
      'Check market prices',
    ],
    '/farmer/merchants': [
      'List merchants',
      'Check prices',
      'Send message',
    ],
  };

  return suggestions[route] || [
    'Go to crops',
    'Show weather',
    'View advisory',
  ];
}

export default VoiceCommandSuggestions;
