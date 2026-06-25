import { useMemo, useState } from "react";
import { MapPin, Navigation, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { getCitiesByState, indianStates } from "@/data/indianLocations";
import { getMandiPricesByMarket, getMandiPricesByState } from "@/data/mandiPrices";
import { getGeoPreference, saveGeoPreference } from "@/lib/phase1-storage";

export const GeoPersonalizationPanel = () => {
  const { user } = useCurrentUser();
  const { language } = useLanguage();
  const { toast } = useToast();
  const storedPreference = useMemo(() => getGeoPreference(), []);
  const [preference, setPreference] = useState({
    ...storedPreference,
    languageCode: language,
    village: storedPreference.village || user.location?.split(",")[0]?.trim() || "Doraha",
  });

  const cityOptions = useMemo(() => getCitiesByState(preference.state), [preference.state]);
  const stateMarkets = useMemo(() => {
    const markets = getMandiPricesByState(preference.state);
    return [...new Set(markets.map((entry) => entry.market))].sort();
  }, [preference.state]);
  const selectedMarketPrices = useMemo(() => getMandiPricesByMarket(preference.preferredMarket).slice(0, 6), [preference.preferredMarket]);

  const handleSave = () => {
    saveGeoPreference({ ...preference, languageCode: language });
    toast({
      title: "Geo-personalization updated",
      description: `Village ${preference.village} and mandi ${preference.preferredMarket} are now your default farmer context.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Village & mandi geo-personalization
        </CardTitle>
        <CardDescription>
          Save your local farming context so prices, alerts, and recommendations stay relevant to your village and preferred market.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="geo-state">State</Label>
            <Select value={preference.state} onValueChange={(value) => setPreference((current) => ({ ...current, state: value, district: getCitiesByState(value)[0] ?? "", preferredMarket: "" }))}>
              <SelectTrigger id="geo-state"><SelectValue /></SelectTrigger>
              <SelectContent>
                {indianStates.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="geo-district">District / city</Label>
            <Select value={preference.district} onValueChange={(value) => setPreference((current) => ({ ...current, district: value }))}>
              <SelectTrigger id="geo-district"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cityOptions.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="geo-village">Village</Label>
            <Input id="geo-village" value={preference.village} onChange={(event) => setPreference((current) => ({ ...current, village: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="geo-market">Preferred mandi</Label>
            <Select value={preference.preferredMarket} onValueChange={(value) => setPreference((current) => ({ ...current, preferredMarket: value }))}>
              <SelectTrigger id="geo-market"><SelectValue placeholder="Select market" /></SelectTrigger>
              <SelectContent>
                {stateMarkets.map((market) => <SelectItem key={market} value={market}>{market}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="geo-crop">Primary crop</Label>
            <Input id="geo-crop" value={preference.primaryCrop} onChange={(event) => setPreference((current) => ({ ...current, primaryCrop: event.target.value }))} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Village: {preference.village}</Badge>
          <Badge variant="outline">Language: {language.toUpperCase()}</Badge>
          <Badge variant="outline">Default mandi: {preference.preferredMarket || "Not selected"}</Badge>
          <Button onClick={handleSave}>Save geo preferences</Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl border p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <Navigation className="h-4 w-4 text-primary" />
              How this personalizes the app
            </h3>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>• Market alerts prioritize {preference.preferredMarket || "your chosen mandi"} first.</p>
              <p>• Crop planning recommendations can match local climate and market windows.</p>
              <p>• Expert consultations carry your saved village and crop context.</p>
              <p>• Offline summaries keep your local defaults ready even without internet.</p>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Nearby mandi snapshot
            </h3>
            <div className="mt-3 space-y-3">
              {selectedMarketPrices.length > 0 ? selectedMarketPrices.map(({ commodity, price }) => (
                <div key={`${commodity}-${price.market}`} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{commodity}</p>
                    <p className="text-muted-foreground">{price.market}, {price.state}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{price.modalPrice}</p>
                    <p className="text-muted-foreground">Modal / quintal</p>
                  </div>
                </div>
              )) : <p className="text-sm text-muted-foreground">Select a mandi to see localized price cards.</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
