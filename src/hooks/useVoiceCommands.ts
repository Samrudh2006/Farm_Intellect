import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { voiceCommandEngine } from '@/lib/voiceCommandEngine';
import { commandExecutor } from '@/services/commandExecutor';
import { toast } from '@/hooks/use-toast';
import type { CommandResult, CommandExecutionContext } from '@/types/voiceCommands';

/**
 * Custom hook for voice command recognition and execution
 * Integrates with FloatingAIAssistant to handle voice-based commands
 */
export const useVoiceCommands = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState<CommandResult | null>(null);
  const commandCacheRef = useRef<Map<string, CommandResult>>(new Map());

  // Initialize command executor context
  useEffect(() => {
    const context: CommandExecutionContext = {
      userId: user?.id || 0,
      currentRoute: location.pathname,
      language: localStorage.getItem('language') || 'en',
      role: (profile?.role as any) || 'guest',
    };
    commandExecutor.setContext(context);
  }, [user, profile, location.pathname]);

  /**
   * Parse and execute voice command
   */
  const executeVoiceCommand = useCallback(
    async (transcription: string): Promise<{ isCommand: boolean; result: CommandResult | null }> => {
      if (!transcription.trim()) {
        return { isCommand: false, result: null };
      }

      setIsProcessing(true);

      try {
        const language = localStorage.getItem('language') || 'en';

        // Check command cache
        const cacheKey = `${transcription.toLowerCase()}_${language}`;
        if (commandCacheRef.current.has(cacheKey)) {
          const cachedResult = commandCacheRef.current.get(cacheKey)!;
          setLastCommand(cachedResult);
          setIsProcessing(false);
          return { isCommand: true, result: cachedResult };
        }

        // Parse command using voice command engine
        const parsed = voiceCommandEngine.parseCommand(
          transcription,
          language,
          location.pathname
        );

        if (!parsed.isCommand) {
          // Not a command, treat as question
          setIsProcessing(false);
          return { isCommand: false, result: null };
        }

        // Execute command
        const result = await commandExecutor.executeCommand(
          parsed.command,
          parsed.type,
          navigate
        );

        // Cache successful command
        if (result.success) {
          commandCacheRef.current.set(cacheKey, result);
          if (commandCacheRef.current.size > 50) {
            // Keep cache size reasonable
            const firstKey = commandCacheRef.current.keys().next().value;
            commandCacheRef.current.delete(firstKey);
          }
        }

        setLastCommand(result);

        // Show feedback
        if (result.feedback) {
          toast({
            title: result.command,
            description: result.feedback,
            duration: 2000,
          });
        }

        setIsProcessing(false);
        return { isCommand: true, result };
      } catch (error) {
        console.error('[v0] Voice command error:', error);
        toast({
          title: 'Command Error',
          description: 'Failed to process voice command',
          variant: 'destructive',
        });
        setIsProcessing(false);
        return { isCommand: false, result: null };
      }
    },
    [navigate, location.pathname]
  );

  /**
   * Get suggested commands for current page
   */
  const getSuggestedCommands = useCallback(() => {
    const currentRoute = location.pathname;
    
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
    };

    return suggestions[currentRoute] || [
      'Go to crops',
      'Show advisory',
      'View weather',
      'Go home',
    ];
  }, [location.pathname]);

  /**
   * Get available commands for user's current context
   */
  const getAvailableCommands = useCallback(() => {
    return {
      navigation: [
        { name: 'Go to crops', hint: 'Navigate to crops section' },
        { name: 'Show advisory', hint: 'View agricultural advisory' },
        { name: 'Check weather', hint: 'View weather information' },
        { name: 'Go to dashboard', hint: 'Navigate to main dashboard' },
        { name: 'Open chat', hint: 'Start a conversation' },
        { name: 'View profile', hint: 'Open your profile' },
      ],
      forms: [
        { name: 'Register farm', hint: 'Register a new farm' },
        { name: 'Add crop', hint: 'Add a new crop to your farm' },
        { name: 'Update profile', hint: 'Update your profile information' },
      ],
      data: [
        { name: 'List my crops', hint: 'See all your crops' },
        { name: 'Market prices', hint: 'Check current market prices' },
        { name: 'Farm details', hint: 'View your farm details' },
      ],
      control: [
        { name: 'Clear history', hint: 'Clear conversation history' },
        { name: 'Go home', hint: 'Return to home' },
        { name: 'Show help', hint: 'Display available commands' },
      ],
    };
  }, []);

  return {
    executeVoiceCommand,
    getSuggestedCommands,
    getAvailableCommands,
    isProcessing,
    lastCommand,
  };
};

export default useVoiceCommands;
