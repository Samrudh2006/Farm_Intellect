import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'cookie_consent_v1';

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem(CONSENT_KEY);
    if (!hasConsent) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ acceptedAt: new Date().toISOString(), choice: 'accepted' }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ acceptedAt: new Date().toISOString(), choice: 'essential-only' }));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur p-4">
      <div className="mx-auto max-w-5xl flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          We use essential cookies to run the app and optional analytics cookies to improve experience.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reject}>Essential only</Button>
          <Button onClick={accept}>Accept all</Button>
        </div>
      </div>
    </div>
  );
};
