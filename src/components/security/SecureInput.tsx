import React, { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import DOMPurify from "dompurify";
import { VALIDATION_PATTERNS } from "@/lib/validationPatterns";

interface SecureInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (sanitized: string) => void;
  validatePattern?: RegExp;
  maxLength?: number;
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * SecureInput Component
 * - Sanitizes all input to prevent XSS attacks
 * - Validates against optional regex patterns
 * - Enforces max length for overflow protection
 * - Provides real-time validation feedback
 */
export const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  (
    {
      onValueChange,
      validatePattern,
      maxLength = 500,
      label,
      error,
      helperText,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;

      // 1. Enforce max length
      if (maxLength && input.length > maxLength) {
        input = input.slice(0, maxLength);
      }

      // 2. Sanitize HTML/XSS
      const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });

      // 3. Validate against pattern if provided
      if (validatePattern && !validatePattern.test(sanitized)) {
        console.warn("[v0] Input validation failed for pattern:", validatePattern);
        return; // Don't update if validation fails
      }

      // 4. Notify parent
      if (onValueChange) {
        onValueChange(sanitized);
      }

      // 5. Call original onChange
      if (onChange) {
        const syncedEvent = { ...e, target: { ...e.target, value: sanitized } };
        onChange(syncedEvent as any);
      }
    };

    return (
      <div className="space-y-1">
        {label && <label className="text-sm font-medium text-foreground">{label}</label>}
        <Input
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        {helperText && !error && <p className="text-xs text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);

SecureInput.displayName = "SecureInput";
