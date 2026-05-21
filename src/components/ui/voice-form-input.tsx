'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface VoiceFormInputProps {
  label: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'select' | 'email' | 'date';
  placeholder?: string;
  options?: string[];
  voiceKeywords?: Record<string, string>;
  voiceInstructions?: string;
  onValueChange: (value: any) => void;
  value?: string | number;
  required?: boolean;
}

/**
 * Voice-enabled form input component
 * Allows users to fill forms using voice commands
 */
export const VoiceFormInput: React.FC<VoiceFormInputProps> = ({
  label,
  fieldName,
  fieldType,
  placeholder,
  options = [],
  voiceKeywords = {},
  voiceInstructions,
  onValueChange,
  value,
  required = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voiceValue, setVoiceValue] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast({
        title: 'Voice not supported',
        description: 'Your browser does not support voice input',
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = localStorage.getItem('language') || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: 'Listening...',
        description: voiceInstructions || `Say the ${label.toLowerCase()}`,
        duration: 2000,
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript?.toLowerCase();
      if (transcript) {
        processVoiceInput(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (e: any) => {
      setIsListening(false);
      toast({
        title: 'Voice error',
        description: `Error: ${e.error}`,
        variant: 'destructive',
      });
    };

    recognition.start();
  };

  const processVoiceInput = (transcript: string) => {
    setIsProcessing(true);
    setVoiceValue(transcript);

    try {
      let parsedValue: any = transcript;

      // Try to match keywords for select fields
      if (fieldType === 'select' && options.length > 0) {
        const matched = options.find((opt) =>
          transcript.includes(opt.toLowerCase())
        );
        if (matched) {
          parsedValue = matched;
        } else {
          // Try fuzzy matching
          const closest = options.find((opt) =>
            opt.toLowerCase().includes(transcript.substring(0, 3))
          );
          if (closest) {
            parsedValue = closest;
          }
        }
      }

      // Parse numbers
      if (fieldType === 'number') {
        const numberMatch = transcript.match(/\d+/);
        if (numberMatch) {
          parsedValue = parseInt(numberMatch[0], 10);
        }
      }

      // Parse dates
      if (fieldType === 'date') {
        // Simple date parsing - "5 january 2024" -> "2024-01-05"
        const dateRegex = /(\d{1,2})\s+(\w+)\s+(\d{4})/;
        const match = transcript.match(dateRegex);
        if (match) {
          const months: Record<string, number> = {
            january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
            july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
          };
          const month = months[match[2].toLowerCase()];
          if (month) {
            const date = `${match[3]}-${String(month).padStart(2, '0')}-${String(match[1]).padStart(2, '0')}`;
            parsedValue = date;
          }
        }
      }

      onValueChange(parsedValue);
      toast({
        title: 'Input received',
        description: `${label}: ${parsedValue}`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Processing error',
        description: 'Could not process voice input',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="flex gap-2">
        {/* Text Input */}
        {fieldType === 'text' || fieldType === 'email' || fieldType === 'number' ? (
          <input
            type={fieldType === 'email' ? 'email' : fieldType === 'number' ? 'number' : 'text'}
            name={fieldName}
            placeholder={placeholder}
            value={value || voiceValue}
            onChange={(e) => onValueChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background"
            required={required}
          />
        ) : fieldType === 'select' ? (
          <select
            name={fieldName}
            value={value || voiceValue}
            onChange={(e) => onValueChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background"
            required={required}
          >
            <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : fieldType === 'date' ? (
          <input
            type="date"
            name={fieldName}
            value={value || voiceValue}
            onChange={(e) => onValueChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm bg-background"
            required={required}
          />
        ) : null}

        {/* Voice Input Button */}
        <Button
          type="button"
          variant={isListening ? 'destructive' : 'outline'}
          size="sm"
          onClick={startVoiceInput}
          disabled={isProcessing}
          className="flex-shrink-0"
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isProcessing ? (
            <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        {/* Confirmation Buttons (if voice input detected) */}
        {voiceValue && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onValueChange(voiceValue);
                setVoiceValue('');
              }}
              className="flex-shrink-0"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setVoiceValue('')}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </>
        )}
      </div>

      {voiceValue && (
        <p className="text-xs text-muted-foreground">
          Heard: <span className="font-medium">{voiceValue}</span>
        </p>
      )}
    </div>
  );
};

export default VoiceFormInput;
