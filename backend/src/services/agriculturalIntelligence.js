/**
 * Agricultural Intelligence Module
 * Enhances voice responses with contextual agricultural knowledge
 * Integrates farm-specific data, weather, season, and market information
 */

import { logger } from '../utils/logger.js';
import prisma from '../config/database.js';

export class AgriculturalIntelligence {
  /**
   * Enrich AI response with contextual agricultural data
   * @param {string} response - The AI response text
   * @param {string} userId - The user ID
   * @param {Object} context - Context object
   * @param {string} context.transcription - The user transcription
   * @param {string} context.intent - The detected intent
   * @param {string} context.language - The language used
   * @returns {Promise<string>} Enriched response
   */
  async enrichResponse(response, userId, context) {
    try {
      // Get user's farm context
      const userFarm = await this.getUserFarmContext(userId);
      if (!userFarm) {
        return response;
      }

      // Add location-specific information
      let enrichedResponse = response;

      // Append relevant data based on intent
      switch (context.intent) {
        case 'crop_recommendation':
          enrichedResponse += await this.appendCropRecommendationData(userFarm);
          break;

        case 'disease_diagnosis':
          enrichedResponse += await this.appendDiseasePrevention(userFarm, context.language);
          break;

        case 'market_prices':
          enrichedResponse += await this.appendMarketData(userFarm);
          break;

        case 'soil_health':
          enrichedResponse += await this.appendSoilData(userFarm);
          break;

        case 'irrigation':
          enrichedResponse += await this.appendWeatherData(userFarm);
          break;
      }

      return enrichedResponse;
    } catch (error) {
      logger.warn('Failed to enrich response:', error);
      return response; // Return original response if enrichment fails
    }
  }

  /**
   * Get user's farm context and profile
   */
  private async getUserFarmContext(userId: string): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: {
          farmDetails: true,
        },
      });

      return user?.farmDetails;
    } catch (error) {
      logger.error('Failed to fetch farm context:', error);
      return null;
    }
  }

  /**
   * Append crop recommendation data with location-specific info
   */
  private async appendCropRecommendationData(farmContext: any): Promise<string> {
    try {
      // Get seasonal crops for the region
      const season = this.getCurrentSeason();
      const region = farmContext.location || 'North India';

      const seasonalAdvice = `\n\nSeasonal Insight (${season}): For your ${region} region, ensure:`;
      const advicePoints = [
        '• Check irrigation availability for your selected crop',
        '• Verify seed availability from certified suppliers',
        '• Ensure proper land preparation 2-3 weeks before sowing',
      ];

      return seasonalAdvice + '\n' + advicePoints.join('\n');
    } catch (error) {
      logger.warn('Failed to append crop data:', error);
      return '';
    }
  }

  /**
   * Append disease prevention measures specific to location
   */
  private async appendDiseasePrevention(farmContext: any, language: string): Promise<string> {
    try {
      const climate = this.getClimateData(farmContext.location);

      const preventionAdvice = `\n\nRegional Disease Alert (${climate.humidity_level}% humidity):`;
      const measures = [
        '• Maintain proper field spacing for air circulation',
        '• Scout daily during high-risk periods',
        '• Use integrated pest management (IPM) approach first',
        '• Apply recommended fungicides only when threshold is reached',
      ];

      return preventionAdvice + '\n' + measures.join('\n');
    } catch (error) {
      logger.warn('Failed to append disease prevention:', error);
      return '';
    }
  }

  /**
   * Append current market prices for region
   */
  private async appendMarketData(farmContext: any): Promise<string> {
    try {
      // In production, fetch from real market data APIs
      // For now, provide general guidance
      const priceAdvice = '\n\nMarket Strategy Tips:';
      const tips = [
        '• Monitor prices at nearest mandis daily',
        '• Coordinate with farmer groups for better prices',
        '• Plan storage if prices are low (if possible)',
        '• Use government price support schemes if available',
      ];

      return priceAdvice + '\n' + tips.join('\n');
    } catch (error) {
      logger.warn('Failed to append market data:', error);
      return '';
    }
  }

  /**
   * Append soil-specific recommendations
   */
  private async appendSoilData(farmContext: any): Promise<string> {
    try {
      const soilAdvice = '\n\nSoil Management Action Plan:';
      const actions = [
        '• Get soil tested at nearest KVK every 2 years',
        '• Apply balanced fertilizer based on soil test',
        `• Add organic matter (5-10 tonnes/ha) for sustainable health`,
        '• Follow crop rotation to maintain soil health',
      ];

      return soilAdvice + '\n' + actions.join('\n');
    } catch (error) {
      logger.warn('Failed to append soil data:', error);
      return '';
    }
  }

  /**
   * Append weather-based irrigation guidance
   */
  private async appendWeatherData(farmContext: any): Promise<string> {
    try {
      // Get current weather (simplified)
      const weatherAdvice = '\n\nWeather-Based Irrigation Guide:';
      const guidelines = [
        '• Check weather forecast before planning irrigation',
        '• If rain expected (25mm+), skip scheduled irrigation',
        '• During high temperature, increase irrigation frequency',
        '• Drip irrigation saves 30-50% water vs flood irrigation',
      ];

      return weatherAdvice + '\n' + guidelines.join('\n');
    } catch (error) {
      logger.warn('Failed to append weather data:', error);
      return '';
    }
  }

  /**
   * Get current agricultural season
   */
  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;

    if (month >= 10 || month <= 2) {
      return 'Rabi (Winter)';
    } else if (month >= 6 && month <= 9) {
      return 'Kharif (Monsoon)';
    } else {
      return 'Zaid (Summer)';
    }
  }

  /**
   * Get climate data for region (simplified)
   */
  private getClimateData(location: string): any {
    // Simplified climate data - in production, fetch from weather APIs
    const climateMap: Record<string, any> = {
      'Punjab': { humidity_level: 65, temp_range: '15-32°C', rainfall: 'Moderate' },
      'Haryana': { humidity_level: 60, temp_range: '12-40°C', rainfall: 'Low-Moderate' },
      'Maharashtra': { humidity_level: 70, temp_range: '18-38°C', rainfall: 'Moderate-High' },
      'Tamil Nadu': { humidity_level: 75, temp_range: '22-36°C', rainfall: 'High' },
      'Karnataka': { humidity_level: 68, temp_range: '18-35°C', rainfall: 'Moderate' },
    };

    return climateMap[location] || { humidity_level: 65, temp_range: '15-35°C', rainfall: 'Moderate' };
  }

  /**
   * Generate multi-language agricultural tips
   */
  getRegionalTips(language: string, category: string): string[] {
    const tips: Record<string, Record<string, string[]>> = {
      'hi-IN': {
        'general': [
          'मिट्टी की जांच हर 2 साल में करवाएं',
          'जैविक खाद का उपयोग करें',
          'फसल चक���र अपनाएं',
        ],
        'irrigation': [
          'बारिश से पहले सिंचाई न करें',
          'ड्रिप सिंचाई से 30-50% पानी बचाएं',
          'फसल के महत्वपूर्ण चरणों पर सिंचाई करें',
        ],
      },
      'pa-IN': {
        'general': [
          'ਮਿਟੀ ਦੀ ਜਾਂਚ ਹਰ 2 ਸਾਲ ਵਿੱਚ ਕਰਵਾਓ',
          'ਜੈਵਿਕ ਖਾਦ ਵਰਤੋ',
          'ਫਸਲ ਚੱਕਰ ਅਪਣਾਓ',
        ],
      },
      'en-IN': {
        'general': [
          'Test soil every 2 years at nearest KVK',
          'Use organic compost and manure',
          'Practice crop rotation',
        ],
        'irrigation': [
          'Skip irrigation if 25mm+ rainfall expected',
          'Use drip irrigation to save 30-50% water',
          'Irrigate at critical crop growth stages',
        ],
      },
    };

    return tips[language]?.[category] || tips['en-IN'][category] || [];
  }
}

export const agriculturalIntelligence = new AgriculturalIntelligence();
export default AgriculturalIntelligence;
