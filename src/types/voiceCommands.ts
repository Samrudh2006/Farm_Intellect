export type CommandType = 'navigation' | 'data' | 'form' | 'action' | 'control';
export type CommandAction = 'navigate' | 'data' | 'execute' | 'form' | 'question';

export interface VoiceCommand {
  id: string;
  name: string;
  patterns: RegExp[];
  langKeywords: Record<string, string[]>;
  type: CommandType;
  handler: (params: any) => Promise<any>;
  confirmationMsg: string;
  successMsg: string;
  errorMsg: string;
  route?: string;
  params?: Record<string, any>;
}

export interface CommandResult {
  success: boolean;
  command: string;
  action: CommandAction;
  data?: any;
  message?: string;
  feedback?: string;
  nextStep?: string;
  route?: string;
}

export interface ParsedCommand {
  intent: string;
  confidence: number;
  command?: VoiceCommand;
  params: Record<string, any>;
  isCommand: boolean;
  reasoning: string;
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  voiceKeywords?: string[];
  options?: string[];
  voicePattern?: RegExp;
  parser?: (value: string) => any;
}

export interface VoiceFormConfig {
  formId: string;
  title: string;
  fields: FormField[];
  successRoute?: string;
  confirmationRequired?: boolean;
}

export interface CommandExecutionContext {
  userId?: string;
  currentRoute: string;
  language: string;
  role?: 'farmer' | 'merchant' | 'expert' | 'admin';
}
