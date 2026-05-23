import { apiFetch } from '@/lib/api';

export type AssistantRole = 'user' | 'assistant' | 'system';

export interface AssistantMessage {
  role: AssistantRole;
  content: string;
}

export interface ChatHistoryMessage {
  id: string;
  message: string;
  type: 'USER' | 'AI_ASSISTANT';
  context: string | null;
  createdAt: string;
}

export interface AssistantCompletionResponse {
  content: string;
}

export interface AssistantChatResponse {
  userMessage: ChatHistoryMessage;
  aiMessage: ChatHistoryMessage;
}

export interface AssistantTranscriptionResponse {
  transcript: string;
  languageCode?: string;
  requestId?: string;
}

export interface AssistantSpeechResponse {
  audioBase64: string;
  mimeType: string;
  requestId?: string;
}

export const fetchChatMessages = async (limit = 30) => {
  return apiFetch<{ messages: ChatHistoryMessage[] }>(`/api/chat/messages?limit=${limit}`);
};

export const sendAssistantMessage = async ({
  message,
  context,
  languageCode,
  mode = 'chat',
}: {
  message: string;
  context?: Record<string, unknown>;
  languageCode?: string;
  mode?: 'chat' | 'disease' | 'recommendation' | 'yield';
}) => {
  return apiFetch<AssistantChatResponse>('/api/chat/message', {
    method: 'POST',
    body: JSON.stringify({ message, context, languageCode, mode }),
  });
};

export const completeAssistantPrompt = async ({
  messages,
  context,
  languageCode,
  mode = 'chat',
}: {
  messages: AssistantMessage[];
  context?: Record<string, unknown>;
  languageCode?: string;
  mode?: 'chat' | 'disease' | 'recommendation' | 'yield';
}) => {
  return apiFetch<AssistantCompletionResponse>('/api/chat/complete', {
    method: 'POST',
    body: JSON.stringify({ messages, context, languageCode, mode }),
  });
};

export const clearAssistantMessages = async () => {
  return apiFetch<{ message: string }>('/api/chat/messages', {
    method: 'DELETE',
  });
};

export const transcribeAssistantAudio = async ({
  audioBlob,
  languageCode,
  mode = 'transcribe',
}: {
  audioBlob: Blob;
  languageCode?: string;
  mode?: 'transcribe' | 'translate' | 'verbatim' | 'translit' | 'codemix';
}) => {
  const formData = new FormData();
  const extension = audioBlob.type.split('/')[1]?.split(';')[0] || 'webm';
  formData.append('audio', audioBlob, `voice-query.${extension}`);

  if (languageCode) {
    formData.append('languageCode', languageCode);
  }

  formData.append('mode', mode);

  return apiFetch<AssistantTranscriptionResponse>('/api/chat/voice/transcribe', {
    method: 'POST',
    body: formData,
  });
};

export const synthesizeAssistantSpeech = async ({
  text,
  targetLanguageCode,
  speaker,
  pace,
}: {
  text: string;
  targetLanguageCode?: string;
  speaker?: string;
  pace?: number;
}) => {
  return apiFetch<AssistantSpeechResponse>('/api/chat/voice/speak', {
    method: 'POST',
    body: JSON.stringify({ text, targetLanguageCode, speaker, pace }),
  });
};
