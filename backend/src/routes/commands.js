import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { logActivity } from '../middleware/activity.js';
import { logger } from '../utils/logger.js';
import { voiceCommandEngine } from '../services/voiceCommandEngine.js';
import prisma from '../config/database.js';

const router = express.Router();

/**
 * Execute voice command
 * Handles navigation, data operations, and form actions
 */
router.post('/execute', authenticate, logActivity, async (req, res) => {
  try {
    const { command, commandType, params = {}, currentRoute = '/farmer/dashboard' } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    logger.info(`Executing command: ${command.name || command} (type: ${commandType})`);

    let result = {
      success: true,
      command: command.name || command,
      commandType,
      action: getActionForCommandType(commandType),
      feedback: getFeedbackForCommand(command, commandType),
      data: {},
    };

    // Handle different command types
    switch (commandType) {
      case 'navigation':
        result.data = {
          route: command.routes?.[0],
          action: 'navigate',
        };
        break;

      case 'data':
        result.data = await handleDataCommand(command, req.user.id);
        break;

      case 'form':
        result.data = {
          formId: command.form,
          route: command.route,
          action: 'open_form',
          message: `Opening ${command.name.replace(/_/g, ' ')} form...`,
        };
        break;

      case 'control':
        result.data = handleControlCommand(command);
        break;

      default:
        return res.status(400).json({ error: `Unknown command type: ${commandType}` });
    }

    // Log command execution
    try {
      await prisma.voiceCommandLog.create({
        data: {
          userId: req.user.id,
          command: command.name || command,
          commandType,
          params: JSON.stringify(params),
          success: true,
          feedback: result.feedback,
        },
      });
    } catch (error) {
      logger.warn('Failed to log command:', error);
    }

    res.json(result);
  } catch (error) {
    logger.error('Command execution error:', error);
    res.status(500).json({ error: 'Failed to execute command' });
  }
});

/**
 * Get available commands for current context
 */
router.get('/available', authenticate, async (req, res) => {
  try {
    const { currentRoute = '/farmer/dashboard' } = req.query;
    const role = req.user.role || 'farmer';

    const commands = {
      navigation: getNavigationCommands(role),
      forms: getFormCommands(role),
      data: getDataCommands(role),
      control: getControlCommands(),
    };

    res.json({
      success: true,
      currentRoute,
      role,
      commands,
    });
  } catch (error) {
    logger.error('Get available commands error:', error);
    res.status(500).json({ error: 'Failed to fetch available commands' });
  }
});

/**
 * Get suggested commands for current page
 */
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const { currentRoute = '/farmer/dashboard' } = req.query;

    const suggestions = {
      '/farmer/crops': [
        'Show my crops',
        'Add new crop',
        'Crop recommendations',
      ],
      '/farmer/advisory': [
        'Get latest advisory',
        'Show all advisories',
        'Filter by crop',
      ],
      '/farmer/weather': [
        'Show weather forecast',
        'Check rain prediction',
        'Temperature trend',
      ],
      '/farmer/dashboard': [
        'Go to crops',
        'Check weather',
        'View advisory',
        'Market prices',
        'Show my profile',
      ],
      '/farmer/merchants': [
        'List merchants',
        'Check market prices',
        'Send message',
      ],
    };

    const defaultSuggestions = [
      'Go to crops',
      'Show weather',
      'Check advisory',
      'Go home',
    ];

    const commands = suggestions[currentRoute] || defaultSuggestions;

    res.json({
      success: true,
      currentRoute,
      suggestions: commands,
    });
  } catch (error) {
    logger.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

/**
 * Get command history for user
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const { limit = 20, commandType } = req.query;

    const where = { userId: req.user.id };
    if (commandType) where.commandType = commandType;

    const history = await prisma.voiceCommandLog.findMany({
      where,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      history,
      total: history.length,
    });
  } catch (error) {
    logger.error('Get command history error:', error);
    res.status(500).json({ error: 'Failed to fetch command history' });
  }
});

/**
 * Get command statistics
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await prisma.voiceCommandLog.groupBy({
      by: ['commandType'],
      where: { userId: req.user.id },
      _count: true,
    });

    const total = await prisma.voiceCommandLog.count({
      where: { userId: req.user.id },
    });

    res.json({
      success: true,
      total,
      byType: stats,
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ─── Helper Functions ───

function getActionForCommandType(commandType) {
  const actions = {
    navigation: 'navigate',
    data: 'data',
    form: 'form',
    control: 'execute',
  };
  return actions[commandType] || 'execute';
}

function getFeedbackForCommand(command, commandType) {
  const name = command.name?.replace(/_/g, ' ') || command;

  switch (commandType) {
    case 'navigation':
      return `Navigating to ${name}...`;
    case 'data':
      return `Fetching ${name}...`;
    case 'form':
      return `Opening ${name} form...`;
    case 'control':
      return `Executing ${name}...`;
    default:
      return `Processing ${name}...`;
  }
}

async function handleDataCommand(command, userId) {
  switch (command.action) {
    case 'fetch_crops':
      return {
        action: 'fetch_crops',
        endpoint: '/api/farm/crops',
        params: { userId },
      };

    case 'fetch_market_prices':
      return {
        action: 'fetch_market_prices',
        endpoint: '/api/market/prices',
        params: {},
      };

    case 'fetch_farm_details':
      return {
        action: 'fetch_farm_details',
        endpoint: '/api/farm/details',
        params: { userId },
      };

    case 'fetch_weather_forecast':
      return {
        action: 'fetch_weather_forecast',
        endpoint: '/api/weather/forecast',
        params: { userId },
      };

    case 'fetch_advisories':
      return {
        action: 'fetch_advisories',
        endpoint: '/api/advisory/list',
        params: { userId },
      };

    default:
      return { error: `Unknown data action: ${command.action}` };
  }
}

function handleControlCommand(command) {
  switch (command.action) {
    case 'clear_history':
      return {
        action: 'clear_history',
        message: 'Clearing conversation history...',
      };

    case 'change_language':
      return {
        action: 'change_language',
        message: 'Please select a language...',
      };

    case 'navigate_home':
      return {
        action: 'navigate',
        route: '/farmer/dashboard',
        message: 'Going home...',
      };

    case 'show_help':
      return {
        action: 'show_help',
        message: 'Displaying available commands...',
      };

    case 'close_assistant':
      return {
        action: 'close',
        message: 'Closing assistant...',
      };

    default:
      return { error: `Unknown control action: ${command.action}` };
  }
}

function getNavigationCommands(role) {
  const baseCommands = [
    { name: 'crops', label: 'Go to crops', route: '/farmer/crops', keywords: ['crop', 'plants'] },
    { name: 'advisory', label: 'Show advisory', route: '/farmer/advisory', keywords: ['advice', 'tips'] },
    { name: 'weather', label: 'Check weather', route: '/farmer/weather', keywords: ['weather', 'rain'] },
    { name: 'dashboard', label: 'Go home', route: '/farmer/dashboard', keywords: ['home', 'dashboard'] },
    { name: 'chat', label: 'Open chat', route: '/farmer/chat', keywords: ['chat', 'message'] },
    { name: 'profile', label: 'View profile', route: '/farmer/profile', keywords: ['profile', 'account'] },
  ];

  if (role === 'merchant') {
    return [
      { name: 'farmers', label: 'View farmers', route: '/merchant/farmers', keywords: ['farmers'] },
      { name: 'prices', label: 'Market prices', route: '/merchant/market-prices', keywords: ['prices'] },
      ...baseCommands.filter(c => c.name === 'dashboard'),
    ];
  }

  return baseCommands;
}

function getFormCommands(role) {
  const baseForms = [
    { name: 'register_farm', label: 'Register farm', form: 'farm-registration', route: '/farmer/features' },
    { name: 'add_crop', label: 'Add crop', form: 'crop-addition', route: '/farmer/crops' },
    { name: 'update_profile', label: 'Update profile', form: 'profile-update', route: '/farmer/profile' },
  ];

  if (role === 'merchant') {
    return [
      { name: 'add_product', label: 'Add product', form: 'product-addition', route: '/merchant/dashboard' },
      ...baseForms,
    ];
  }

  return baseForms;
}

function getDataCommands(role) {
  const baseData = [
    { name: 'list_crops', label: 'List my crops', action: 'fetch_crops' },
    { name: 'market_prices', label: 'Market prices', action: 'fetch_market_prices' },
    { name: 'farm_details', label: 'Farm details', action: 'fetch_farm_details' },
    { name: 'weather_forecast', label: 'Weather forecast', action: 'fetch_weather_forecast' },
    { name: 'advisories', label: 'All advisories', action: 'fetch_advisories' },
  ];

  return baseData;
}

function getControlCommands() {
  return [
    { name: 'clear_history', label: 'Clear history', action: 'clear_history' },
    { name: 'change_language', label: 'Change language', action: 'change_language' },
    { name: 'go_home', label: 'Go home', action: 'navigate_home' },
    { name: 'help', label: 'Show help', action: 'show_help' },
    { name: 'close', label: 'Close assistant', action: 'close_assistant' },
  ];
}

export default router;
