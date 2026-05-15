import { Turnstile } from "react-turnstile";
import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark";
  size?: "normal" | "compact";
}

export const TurnstileWidget = ({
  onVerify,
  onError,
  onExpire,
  theme = "light",
  size = "normal",
}: TurnstileWidgetProps) => {
  const turnstileRef = useRef<any>(null);

  // Get site key from environment
  const siteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.warn("[v0] Cloudflare Turnstile site key not configured. Set VITE_CLOUDFLARE_TURNSTILE_SITE_KEY in .env");
    return (
      <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        Bot protection disabled - configure Cloudflare Turnstile
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        ref={turnstileRef}
        sitekey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        onExpire={onExpire}
        theme={theme}
        size={size}
        language="auto"
        appearanceObserver={true}
        hideWidget={false}
      />
    </div>
  );
};

export const resetTurnstile = (ref: any) => {
  if (ref?.current) {
    ref.current.reset();
  }
};

export const getTurnstileToken = (ref: any): string | null => {
  if (ref?.current) {
    return ref.current.getResponse();
  }
  return null;
};
