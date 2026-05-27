import { hasSupabaseEnv, supabase } from '@/integrations/supabase/client';

// ============= ERROR LOGGING =============

interface ErrorLog {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  url: string;
  userAgent: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private errorQueue: ErrorLog[] = [];
  private maxQueueSize = 50;
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAutoFlush();
    this.setupGlobalErrorHandler();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  // Determine error severity
  private determineSeverity(
    message: string,
    stack?: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const lowerMessage = message.toLowerCase();

    // Critical errors
    if (
      lowerMessage.includes('fatal') ||
      lowerMessage.includes('crash') ||
      lowerMessage.includes('security') ||
      lowerMessage.includes('authentication failed')
    ) {
      return 'critical';
    }

    // High severity
    if (
      lowerMessage.includes('error') ||
      lowerMessage.includes('failed') ||
      lowerMessage.includes('denied')
    ) {
      return 'high';
    }

    // Medium severity
    if (lowerMessage.includes('warning') || lowerMessage.includes('deprecated')) {
      return 'medium';
    }

    return 'low';
  }

  logError(
    error: Error | string,
    context?: Record<string, any>,
    severity?: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const determinedSeverity = severity || this.determineSeverity(message, stack);

    const errorLog: ErrorLog = {
      message,
      stack,
      context,
      severity: determinedSeverity,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('[Error Logger]', {
        message,
        context,
        severity: determinedSeverity,
        stack,
      });
    }

    // Add to queue
    this.errorQueue.push(errorLog);

    // Flush immediately for critical errors
    if (determinedSeverity === 'critical') {
      this.flush();
    }

    // Trim queue if it gets too large
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }
  }

  private startAutoFlush(): void {
    // Flush errors every 30 seconds
    this.flushInterval = setInterval(() => {
      if (this.errorQueue.length > 0) {
        this.flush();
      }
    }, 30000);
  }

  async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const logsToSend = [...this.errorQueue];
    this.errorQueue = [];

    try {
      if (!hasSupabaseEnv) {
        console.debug("[Mock Security Logger] Flushed errors:", logsToSend);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();

      // Insert error logs
      await supabase.from('audit_logs').insert(
        logsToSend.map((log) => ({
          user_id: user?.id,
          action: `error_${log.severity}`,
          entity_type: 'system',
          old_values: null,
          new_values: {
            message: log.message,
            stack: log.stack,
            context: log.context,
            url: log.url,
          },
          ip_address: null,
          user_agent: log.userAgent,
        }))
      );
    } catch (error) {
      // Re-add errors to queue if flush fails
      this.errorQueue = [...logsToSend, ...this.errorQueue];
      console.error('[Error Logger] Failed to flush errors:', error);
    }
  }

  private setupGlobalErrorHandler(): void {
    window.addEventListener('error', (event) => {
      this.logError(event.error, { type: 'uncaught_error' }, 'critical');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logError(event.reason, { type: 'unhandled_rejection' }, 'critical');
    });
  }

  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flush();
  }
}

export const errorLogger = ErrorLogger.getInstance();

// ============= SECURITY EVENT LOGGING =============

export interface SecurityEvent {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
}

export const logSecurityEvent = async (event: SecurityEvent): Promise<void> => {
  try {
    if (!hasSupabaseEnv) {
      console.debug("[Mock Security Logger] Logged security event:", event);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('audit_logs').insert([
      {
        user_id: user?.id,
        action: `security_event_${event.severity}`,
        entity_type: 'security',
        old_values: null,
        new_values: {
          eventType: event.eventType,
          description: event.description,
          details: event.details,
        },
        ip_address: event.ipAddress,
        user_agent: navigator.userAgent,
      },
    ]);
  } catch (error) {
    console.error('[Security Logger] Failed to log security event:', error);
  }
};

// ============= SUSPICIOUS ACTIVITY DETECTION =============

class SuspiciousActivityDetector {
  private static instance: SuspiciousActivityDetector;
  private failedAttempts = new Map<string, number>();
  private suspiciousIPs = new Set<string>();
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  private constructor() {
    this.startCleanupInterval();
  }

  static getInstance(): SuspiciousActivityDetector {
    if (!SuspiciousActivityDetector.instance) {
      SuspiciousActivityDetector.instance = new SuspiciousActivityDetector();
    }
    return SuspiciousActivityDetector.instance;
  }

  recordFailedAttempt(identifier: string): boolean {
    const currentCount = this.failedAttempts.get(identifier) || 0;
    const newCount = currentCount + 1;

    this.failedAttempts.set(identifier, newCount);

    if (newCount >= this.MAX_FAILED_ATTEMPTS) {
      // Log suspicious activity
      logSecurityEvent({
        eventType: 'excessive_failed_attempts',
        severity: 'high',
        description: `Excessive failed login attempts for ${identifier}`,
        details: { attemptCount: newCount },
      });

      // Lock out after lockout duration
      setTimeout(() => {
        this.failedAttempts.delete(identifier);
      }, this.LOCKOUT_DURATION);

      return false;
    }

    return true;
  }

  recordSuccessfulAttempt(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  isLocked(identifier: string): boolean {
    const count = this.failedAttempts.get(identifier) || 0;
    return count >= this.MAX_FAILED_ATTEMPTS;
  }

  recordSuspiciousIP(ip: string): void {
    this.suspiciousIPs.add(ip);

    logSecurityEvent({
      eventType: 'suspicious_ip_detected',
      severity: 'medium',
      description: `Suspicious IP address detected: ${ip}`,
      ipAddress: ip,
    });
  }

  isSuspiciousIP(ip: string): boolean {
    return this.suspiciousIPs.has(ip);
  }

  private startCleanupInterval(): void {
    // Clean up old failed attempts every hour
    setInterval(() => {
      const now = Date.now();
      for (const [key, timestamp] of this.failedAttempts.entries()) {
        if (typeof timestamp === 'number' && now - timestamp > this.LOCKOUT_DURATION) {
          this.failedAttempts.delete(key);
        }
      }
    }, 60 * 60 * 1000);
  }
}

export const suspiciousActivityDetector = SuspiciousActivityDetector.getInstance();

// ============= DATA ACCESS LOGGING =============

export const logDataAccess = async (
  userId: string,
  entityType: string,
  entityId: string,
  action: 'read' | 'create' | 'update' | 'delete'
): Promise<void> => {
  try {
    if (!hasSupabaseEnv) {
      console.debug("[Mock Security Logger] Logged data access:", { userId, entityType, entityId, action });
      return;
    }
    await supabase.from('audit_logs').insert([
      {
        user_id: userId,
        action: `data_${action}`,
        entity_type: entityType,
        entity_id: entityId,
        user_agent: navigator.userAgent,
      },
    ]);
  } catch (error) {
    console.error('[Data Access Logger] Failed to log data access:', error);
  }
};

// ============= COMPLIANCE MONITORING =============

export interface ComplianceCheck {
  checkName: string;
  status: 'pass' | 'fail' | 'warning';
  details?: string;
  timestamp: string;
}

const complianceChecks: ComplianceCheck[] = [];

export const performComplianceCheck = (check: ComplianceCheck): void => {
  complianceChecks.push(check);

  if (check.status === 'fail') {
    logSecurityEvent({
      eventType: 'compliance_check_failed',
      severity: 'critical',
      description: `Compliance check failed: ${check.checkName}`,
      details: { details: check.details },
    });
  } else if (check.status === 'warning') {
    logSecurityEvent({
      eventType: 'compliance_warning',
      severity: 'medium',
      description: `Compliance warning: ${check.checkName}`,
      details: { details: check.details },
    });
  }
};

export const getComplianceReport = (): ComplianceCheck[] => {
  return [...complianceChecks];
};

// ============= PERFORMANCE MONITORING =============

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  threshold?: number;
}

export const logPerformanceMetric = (name: string, duration: number, threshold?: number): void => {
  const metric: PerformanceMetric = {
    name,
    duration,
    timestamp: new Date().toISOString(),
    threshold,
  };

  if (threshold && duration > threshold) {
    logSecurityEvent({
      eventType: 'performance_threshold_exceeded',
      severity: 'low',
      description: `Performance metric exceeded threshold: ${name}`,
      details: { duration, threshold, percentage: Math.round((duration / threshold) * 100) },
    });
  }

  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${duration}ms${threshold ? ` (threshold: ${threshold}ms)` : ''}`);
  }
};

// ============= MEMORY LEAK DETECTION =============

export const checkMemoryUsage = (): void => {
  if (typeof (performance as any).memory === 'undefined') {
    return; // Chrome only
  }

  const memory = (performance as any).memory;
  const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

  if (usagePercentage > 90) {
    logSecurityEvent({
      eventType: 'high_memory_usage',
      severity: 'medium',
      description: `High memory usage detected: ${usagePercentage.toFixed(2)}%`,
      details: { usagePercentage, heapSize: memory.usedJSHeapSize },
    });
  }
};

// Initialize memory check every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(checkMemoryUsage, 5 * 60 * 1000);
}
