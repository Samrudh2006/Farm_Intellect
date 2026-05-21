import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import type { CommandResult, ParsedCommand, CommandExecutionContext } from '@/types/voiceCommands';

/**
 * Frontend command executor - maps voice commands to app actions
 */
class CommandExecutor {
  private context: CommandExecutionContext | null = null;

  setContext(context: CommandExecutionContext) {
    this.context = context;
  }

  /**
   * Execute a parsed command and return result
   */
  async executeCommand(
    command: any,
    type: string,
    navigate: any,
    params?: any
  ): Promise<CommandResult> {
    if (!this.context) {
      return {
        success: false,
        command: command?.name || 'unknown',
        action: 'execute',
        message: 'Context not initialized',
      };
    }

    try {
      switch (type) {
        case 'navigation':
          return this.executeNavigation(command, navigate);

        case 'data':
          return this.executeDataOperation(command, params);

        case 'form':
          return this.executeFormCommand(command, navigate);

        case 'control':
          return this.executeControlCommand(command, navigate);

        case 'question':
          return {
            success: true,
            command: 'question',
            action: 'question',
            feedback: 'Processing your question...',
          };

        default:
          return {
            success: false,
            command,
            action: 'execute',
            message: `Unknown command type: ${type}`,
          };
      }
    } catch (error) {
      console.error('[v0] Command execution error:', error);
      return {
        success: false,
        command: command?.name || 'unknown',
        action: 'execute',
        message: error instanceof Error ? error.message : 'Command execution failed',
      };
    }
  }

  /**
   * Execute navigation commands
   */
  private executeNavigation(command: any, navigate: any): CommandResult {
    const route = command?.routes?.[0];

    if (!route) {
      return {
        success: false,
        command: command?.name || 'navigation',
        action: 'navigate',
        message: 'No route found for command',
      };
    }

    try {
      navigate(route);
      return {
        success: true,
        command: command?.name || 'navigation',
        action: 'navigate',
        route,
        feedback: `Navigating to ${command?.name.replace(/_/g, ' ')}...`,
        message: `Navigated to ${route}`,
      };
    } catch (error) {
      return {
        success: false,
        command: command?.name || 'navigation',
        action: 'navigate',
        message: `Navigation failed: ${error}`,
      };
    }
  }

  /**
   * Execute data operation commands
   */
  private async executeDataOperation(
    command: any,
    params?: any
  ): Promise<CommandResult> {
    const action = command?.action;

    switch (action) {
      case 'fetch_crops':
        return {
          success: true,
          command: 'fetch_crops',
          action: 'data',
          feedback: 'Fetching your crops...',
          message: 'Crops fetched',
        };

      case 'fetch_market_prices':
        return {
          success: true,
          command: 'fetch_market_prices',
          action: 'data',
          feedback: 'Getting market prices...',
          message: 'Market prices loaded',
        };

      case 'fetch_farm_details':
        return {
          success: true,
          command: 'fetch_farm_details',
          action: 'data',
          feedback: 'Loading farm details...',
          message: 'Farm details loaded',
        };

      case 'fetch_weather_forecast':
        return {
          success: true,
          command: 'fetch_weather_forecast',
          action: 'data',
          feedback: 'Getting weather forecast...',
          message: 'Weather forecast loaded',
        };

      case 'fetch_advisories':
        return {
          success: true,
          command: 'fetch_advisories',
          action: 'data',
          feedback: 'Loading advisories...',
          message: 'Advisories loaded',
        };

      default:
        return {
          success: false,
          command: action || 'data_operation',
          action: 'data',
          message: `Unknown data operation: ${action}`,
        };
    }
  }

  /**
   * Execute form commands
   */
  private executeFormCommand(command: any, navigate: any): CommandResult {
    const formRoute = command?.route;
    const formId = command?.form;

    if (!formRoute) {
      return {
        success: false,
        command: command?.name || 'form',
        action: 'form',
        message: 'No form found for this command',
      };
    }

    try {
      // Navigate to form page
      navigate(formRoute);

      return {
        success: true,
        command: command?.name || 'form',
        action: 'form',
        route: formRoute,
        feedback: `Opening ${command?.name.replace(/_/g, ' ')} form...`,
        message: `Form opened: ${formId}`,
        nextStep: 'Say the information to fill the form, or say "cancel" to exit',
      };
    } catch (error) {
      return {
        success: false,
        command: command?.name || 'form',
        action: 'form',
        message: `Form navigation failed: ${error}`,
      };
    }
  }

  /**
   * Execute control commands
   */
  private executeControlCommand(command: any, navigate: any): CommandResult {
    const action = command?.action;

    switch (action) {
      case 'clear_history':
        // Clear message history from local state
        return {
          success: true,
          command: 'clear_history',
          action: 'execute',
          feedback: 'Clearing conversation history...',
          message: 'History cleared',
        };

      case 'change_language':
        return {
          success: true,
          command: 'change_language',
          action: 'execute',
          feedback: 'Please select a language...',
          message: 'Language change initiated',
          nextStep: 'Select your preferred language',
        };

      case 'navigate_home':
        navigate('/farmer/dashboard');
        return {
          success: true,
          command: 'navigate_home',
          action: 'navigate',
          feedback: 'Going home...',
          message: 'Navigated to home',
          route: '/farmer/dashboard',
        };

      case 'show_help':
        return {
          success: true,
          command: 'show_help',
          action: 'execute',
          feedback: 'Showing available commands...',
          message: 'Help displayed',
        };

      case 'close_assistant':
        return {
          success: true,
          command: 'close_assistant',
          action: 'execute',
          feedback: 'Closing assistant...',
          message: 'Assistant closed',
        };

      default:
        return {
          success: false,
          command: action || 'control',
          action: 'execute',
          message: `Unknown control action: ${action}`,
        };
    }
  }
}

export const commandExecutor = new CommandExecutor();
export default commandExecutor;
