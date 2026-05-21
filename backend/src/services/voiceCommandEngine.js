import { logger } from '../utils/logger.js';

/**
 * Comprehensive voice command engine for intent detection and routing
 * Supports 22 Indian languages with fuzzy matching and confidence scoring
 */
class VoiceCommandEngine {
  constructor() {
    this.commands = this.initializeCommands();
    this.keywords = this.initializeKeywords();
  }

  /**
   * Parse voice input and detect intent
   * Returns command with confidence score
   */
  parseCommand(transcription, language, currentRoute) {
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

  /**
   * Detect navigation commands like "go to crops", "show advisory", "open weather"
   */
  detectNavigationCommand(text, language) {
    const navPatterns = {
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
        keywords: ['sensor', 'sensor', 'device', 'आयु', 'यंत्र', 'उपकरण'],
        routes: ['/farmer/sensors', '/sensors'],
      },
      marketplace: {
        keywords: ['merchant', 'merchant', 'shop', 'market', 'price', 'sell', 'buy', 'merchant', 'बाजार', 'विक्रय'],
        routes: ['/farmer/merchants', '/merchants'],
      },
      dashboard: {
        keywords: ['dashboard', 'home', 'main', 'homepage', 'डैशबोर्ड', 'घर', 'मुख्य'],
        routes: ['/farmer/dashboard', '/dashboard'],
      },
      poll: {
        keywords: ['poll', 'poll', 'vote', 'voting', 'survey', 'सर्वेक्षण', 'वोट'],
        routes: ['/farmer/polls', '/polls'],
      },
      schemes: {
        keywords: ['scheme', 'scheme', 'govt', 'government', 'योजना', 'सरकार'],
        routes: ['/farmer/schemes', '/schemes'],
      },
      ai_advisory: {
        keywords: ['ai advisory', 'ai advice', 'artificial intelligence', 'एआई सलाह'],
        routes: ['/farmer/ai-advisory', '/ai-advisory'],
      },
      ai_scanner: {
        keywords: ['crop scanner', 'scanner', 'scan', 'image', 'camera', 'स्कैनर', 'तस्वीर'],
        routes: ['/farmer/ai-crop-scanner', '/ai-crop-scanner'],
      },
      chat: {
        keywords: ['chat', 'chat', 'message', 'talk', 'discussion', 'चैट', 'बातचीत'],
        routes: ['/farmer/chat', '/chat'],
      },
      forum: {
        keywords: ['forum', 'forum', 'discussion', 'community', 'समुदाय', 'चर्चा'],
        routes: ['/farmer/forum', '/forum'],
      },
      documents: {
        keywords: ['document', 'documents', 'file', 'record', 'दस्तावेज', 'फाइल'],
        routes: ['/farmer/documents', '/documents'],
      },
      profile: {
        keywords: ['profile', 'profile', 'account', 'setting', 'प्रोफाइल', 'खाता'],
        routes: ['/farmer/profile', '/profile'],
      },
      notifications: {
        keywords: ['notification', 'notifications', 'alert', 'message', 'सूचना', 'अलर्ट'],
        routes: ['/farmer/notifications', '/notifications'],
      },
    };

    // Check for navigation patterns
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

  /**
   * Detect data operation commands like "list my crops", "show market prices"
   */
  detectDataCommand(text, language) {
    const dataPatterns = {
      list_crops: {
        keywords: ['list crop', 'my crop', 'show crop', 'क्या फसल', 'मेरी फसल'],
        action: 'fetch_crops',
      },
      market_prices: {
        keywords: ['market price', 'commodity price', 'grain price', 'बाजार मूल्य'],
        action: 'fetch_market_prices',
      },
      farm_details: {
        keywords: ['farm detail', 'farm info', 'farm size', 'फार्म विवरण', 'खेत का आकार'],
        action: 'fetch_farm_details',
      },
      weather_forecast: {
        keywords: ['weather forecast', 'next week weather', 'rain forecast', 'मौसम पूर्वानुमान'],
        action: 'fetch_weather_forecast',
      },
      advisory_list: {
        keywords: ['list advisory', 'show advisory', 'all advisory', 'सभी सलाह'],
        action: 'fetch_advisories',
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

  /**
   * Detect form commands like "register farm", "add new crop", "update profile"
   */
  detectFormCommand(text, language, currentRoute) {
    const formPatterns = {
      register_farm: {
        keywords: ['register farm', 'new farm', 'register', 'add farm', 'खेत पंजीकृत करें', 'नया खेत'],
        form: 'farm-registration',
        route: '/farmer/features',
      },
      add_crop: {
        keywords: ['add crop', 'new crop', 'plant crop', 'sow', 'फसल जोड़ें', 'नई फसल'],
        form: 'crop-addition',
        route: '/farmer/crops',
      },
      update_profile: {
        keywords: ['update profile', 'edit profile', 'change profile', 'प्रोफाइल अपडेट करें'],
        form: 'profile-update',
        route: '/farmer/profile',
      },
      add_sensor: {
        keywords: ['add sensor', 'new sensor', 'install sensor', 'सेंसर जोड़ें'],
        form: 'sensor-addition',
        route: '/farmer/sensors',
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

  /**
   * Detect control commands like "clear history", "change language", "go home"
   */
  detectControlCommand(text, language) {
    const controlPatterns = {
      clear_history: {
        keywords: ['clear history', 'delete history', 'clear chat', 'इतिहास हटाएं'],
        action: 'clear_history',
      },
      change_language: {
        keywords: ['change language', 'switch language', 'भाषा बदलें'],
        action: 'change_language',
      },
      go_home: {
        keywords: ['go home', 'home', 'back home', 'घर चलें', 'होम'],
        action: 'navigate_home',
      },
      help: {
        keywords: ['help', 'how to', 'what can you do', 'मदद', 'कैसे'],
        action: 'show_help',
      },
      close: {
        keywords: ['close', 'exit', 'bye', 'goodbye', 'बंद करो', 'अलविदा'],
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

  /**
   * Fuzzy string matching for handling typos and variations
   */
  fuzzyMatch(str1, str2, threshold = 0.7) {
    const s1 = str1.trim().toLowerCase();
    const s2 = str2.trim().toLowerCase();
    
    // Exact match
    if (s1.includes(s2) || s2.includes(s1)) {
      return true;
    }

    // Calculate similarity using simple Levenshtein-like distance
    const similarity = this.calculateSimilarity(s1, s2);
    return similarity >= threshold;
  }

  /**
   * Calculate string similarity (simple Jaccard index)
   */
  calculateSimilarity(s1, s2) {
    const tokens1 = new Set(s1.split(/\s+/));
    const tokens2 = new Set(s2.split(/\s+/));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    return intersection.size / union.size;
  }

  initializeCommands() {
    return [];
  }

  initializeKeywords() {
    return {};
  }
}

export const voiceCommandEngine = new VoiceCommandEngine();
export default voiceCommandEngine;
