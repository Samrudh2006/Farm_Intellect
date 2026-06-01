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
    console.debug("[v0] Cloudflare Turnstile not configured - bot protection disabled");
    // Silently return null when not configured
    return null;
  }

  return (
    <div className="flex justify-center my-4">
      <Turnstile
        sitekey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        onExpire={onExpire}
        theme={theme}
        size={size}
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
