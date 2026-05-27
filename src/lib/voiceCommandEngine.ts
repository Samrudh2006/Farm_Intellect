/**
 * Frontend voice command engine - mirrors backend engine for client-side parsing
 * Provides fuzzy matching and confidence scoring
 */
export class VoiceCommandEngine {
  /**
   * Parse voice input and detect intent
   */
  parseCommand(transcription: string, language: string, currentRoute: string) {
    const text = transcription.toLowerCase().trim();

    // Check if it's a navigation command
    const navCommand = this.detectNavigationCommand(text, language);
    if (navCommand.confidence > 0.7) {
      return {
        isCommand: true,
        type: 'navigation',
        command: navCommand,
        confidence: navCommand.confidence,
      };
    }

    // Check if it's a data operation command
    const dataCommand = this.detectDataCommand(text, language);
    if (dataCommand.confidence > 0.7) {
      return {
        isCommand: true,
        type: 'data',
        command: dataCommand,
        confidence: dataCommand.confidence,
      };
    }

    // Check if it's a form command
    const formCommand = this.detectFormCommand(text, language, currentRoute);
    if (formCommand.confidence > 0.7) {
      return {
        isCommand: true,
        type: 'form',
        command: formCommand,
        confidence: formCommand.confidence,
      };
    }

    // Check if it's a control command
    const controlCommand = this.detectControlCommand(text, language);
    if (controlCommand.confidence > 0.7) {
      return {
        isCommand: true,
        type: 'control',
        command: controlCommand,
        confidence: controlCommand.confidence,
      };
    }

    // Default: treat as question
    return {
      isCommand: false,
      type: 'question',
      confidence: 0,
    };
  }

  private detectNavigationCommand(text: string, language: string) {
    const navPatterns: Record<string, { keywords: string[]; routes: string[] }> = {
      crops: {
        keywords: ['crop', 'crops', 'farm', 'plant', 'farming', 'cultivation', 'खेत', 'फसल', 'पौधे'],
        routes: ['/farmer/crops', '/crops'],
      },
      advisory: {
        keywords: ['advisory', 'advice', 'suggestion', 'सलाह', 'सुझाव', 'मार्गदर्शन'],
        routes: ['/farmer/advisory', '/advisory'],
      },
      weather: {
        keywords: ['weather', 'rain', 'temperature', 'climate', 'forecast', 'मौसम', 'बारिश', 'तापमान'],
        routes: ['/farmer/weather', '/weather'],
      },
      sensors: {
        keywords: ['sensor', 'device', 'यंत्र', 'उपकरण'],
        routes: ['/farmer/sensors', '/sensors'],
      },
      marketplace: {
        keywords: ['merchant', 'shop', 'market', 'price', 'sell', 'buy', 'बाजार', 'विक्रय'],
        routes: ['/farmer/merchants', '/merchants'],
      },
      dashboard: {
        keywords: ['dashboard', 'home', 'main', 'homepage', 'डैशबोर्ड', 'घर', 'मुख्य'],
        routes: ['/farmer/dashboard', '/dashboard'],
      },
      ai_advisory: {
        keywords: ['ai advisory', 'ai advice', 'artificial intelligence', 'एआई सलाह'],
        routes: ['/farmer/ai-advisory', '/ai-advisory'],
      },
      chat: {
        keywords: ['chat', 'message', 'talk', 'discussion', 'चैट', 'बातचीत'],
        routes: ['/farmer/chat', '/chat'],
      },
      profile: {
        keywords: ['profile', 'account', 'setting', 'प्रोफाइल', 'खाता'],
        routes: ['/farmer/profile', '/profile'],
      },
      login: {
        keywords: ['login', 'sign in', 'log in', 'लॉगिन', 'साइन इन'],
        routes: ['/login'],
      },
      register: {
        keywords: ['register', 'sms', 'registration', 'रजिस्टर', 'पंजीकरण'],
        routes: ['/sms-register'],
      },
    };

    for (const [target, pattern] of Object.entries(navPatterns)) {
      const match = pattern.keywords.some(kw => this.fuzzyMatch(text, kw, 0.7));
      if (match) {
        return {
          name: target,
          routes: pattern.routes,
          confidence: 0.95,
          action: 'navigate',
        };
      }
    }

    return { confidence: 0, action: 'navigate' };
  }

  private detectDataCommand(text: string, language: string) {
    const dataPatterns: Record<string, { keywords: string[]; action: string }> = {
      list_crops: {
        keywords: ['list crop', 'my crop', 'show crop', 'क्या फसल', 'मेरी फसल'],
        action: 'fetch_crops',
      },
      market_prices: {
        keywords: ['market price', 'commodity price', 'बाजार मूल्य'],
        action: 'fetch_market_prices',
      },
      farm_details: {
        keywords: ['farm detail', 'farm info', 'farm size', 'फार्म विवरण'],
        action: 'fetch_farm_details',
      },
      weather_forecast: {
        keywords: ['weather forecast', 'rain forecast', 'मौसम पूर्वानुमान'],
        action: 'fetch_weather_forecast',
      },
    };

    for (const [target, pattern] of Object.entries(dataPatterns)) {
      const match = pattern.keywords.some(kw => this.fuzzyMatch(text, kw, 0.7));
      if (match) {
        return {
          name: target,
          action: pattern.action,
          confidence: 0.9,
        };
      }
    }

    return { confidence: 0, action: 'data' };
  }

  private detectFormCommand(text: string, language: string, currentRoute: string) {
    const formPatterns: Record<string, { keywords: string[]; form: string; route: string }> = {
      register_farm: {
        keywords: ['register farm', 'new farm', 'खेत पंजीकृत करें'],
        form: 'farm-registration',
        route: '/farmer/features',
      },
      add_crop: {
        keywords: ['add crop', 'new crop', 'फसल जोड़ें'],
        form: 'crop-addition',
        route: '/farmer/crops',
      },
      update_profile: {
        keywords: ['update profile', 'edit profile', 'प्रोफाइल अपडेट करें'],
        form: 'profile-update',
        route: '/farmer/profile',
      },
    };

    for (const [target, pattern] of Object.entries(formPatterns)) {
      const match = pattern.keywords.some(kw => this.fuzzyMatch(text, kw, 0.7));
      if (match) {
        return {
          name: target,
          form: pattern.form,
          route: pattern.route,
          confidence: 0.9,
          action: 'form',
        };
      }
    }

    return { confidence: 0, action: 'form' };
  }

  private detectControlCommand(text: string, language: string) {
    const controlPatterns: Record<string, { keywords: string[]; action: string }> = {
      clear_history: {
        keywords: ['clear history', 'delete history', 'इतिहास हटाएं'],
        action: 'clear_history',
      },
      change_language: {
        keywords: ['change language', 'switch language', 'भाषा बदलें'],
        action: 'change_language',
      },
      go_home: {
        keywords: ['go home', 'home', 'घर चलें'],
        action: 'navigate_home',
      },
      help: {
        keywords: ['help', 'how to', 'मदद', 'कैसे'],
        action: 'show_help',
      },
      close: {
        keywords: ['close', 'exit', 'bye', 'बंद करो'],
        action: 'close_assistant',
      },
    };

    for (const [target, pattern] of Object.entries(controlPatterns)) {
      const match = pattern.keywords.some(kw => this.fuzzyMatch(text, kw, 0.7));
      if (match) {
        return {
          name: target,
          action: pattern.action,
          confidence: 0.9,
        };
      }
    }

    return { confidence: 0, action: 'control' };
  }

  private fuzzyMatch(str1: string, str2: string, threshold = 0.7): boolean {
    const s1 = str1.trim().toLowerCase();
    const s2 = str2.trim().toLowerCase();

    if (s1.includes(s2) || s2.includes(s1)) {
      return true;
    }

    const similarity = this.calculateSimilarity(s1, s2);
    return similarity >= threshold;
  }

  private calculateSimilarity(s1: string, s2: string): number {
    const tokens1 = new Set(s1.split(/\s+/));
    const tokens2 = new Set(s2.split(/\s+/));

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);

    return intersection.size / union.size;
  }
}

export const voiceCommandEngine = new VoiceCommandEngine();
export default voiceCommandEngine;
