import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, CloudSun, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LottieAnimation, LOTTIE_URLS } from "@/components/ui/lottie-animation";

const weatherIcons: Record<string, typeof Sun> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Drizzle: CloudRain,
};

export const WeatherWidget = () => {
  const { user } = useCurrentUser();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const city = user?.location || "Chandigarh";
        const res = await supabase.functions.invoke("weather", { body: { city } });
        if (res.data?.current) {
          const cur = res.data.current;
          const fore = res.data.forecast;

          const dailyMap = new Map<string, any[]>();
          for (const item of (fore?.list || [])) {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyMap.has(date)) dailyMap.set(date, []);
            dailyMap.get(date)!.push(item);
          }

          const forecast = Array.from(dailyMap.entries()).slice(0, 5).map(([date, items], i) => {
            const temps = items.map((it: any) => it.main.temp);
            const cond = items[Math.floor(items.length / 2)].weather[0].main;
            return {
              day: i === 0 ? "Today" : new Date(date).toLocaleDateString("en-IN", { weekday: "short" }),
              temp: Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length),
              condition: cond,
            };
          });

          setWeather({
            temperature: Math.round(cur.main.temp),
            humidity: cur.main.humidity,
            windSpeed: Math.round(cur.wind.speed * 3.6),
            condition: cur.weather[0].main,
            description: cur.weather[0].description,
            forecast,
          });
        }
      } catch (e) {
        console.error("Weather widget error:", e);
      }
      setLoading(false);
    };
    fetchWeather();
  }, [user?.location]);

  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CloudSun className="h-5 w-5 text-primary" /> Weather</CardTitle></CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="w-16 h-16">
            <LottieAnimation url={LOTTIE_URLS.weather} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CloudSun className="h-5 w-5 text-primary" /> Weather</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">Could not load weather data</p></CardContent>
      </Card>
    );
  }

  const WeatherIcon = weatherIcons[weather.condition] || CloudSun;
  const isOptimal = weather.temperature > 10 && weather.temperature < 40 && weather.humidity > 30 && weather.humidity < 80;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudSun className="h-5 w-5 text-primary" />
          Weather Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <WeatherIcon className="h-8 w-8 text-accent" />
            <div>
              <div className="text-2xl font-bold">{weather.temperature}°C</div>
              <div className="text-sm text-muted-foreground capitalize">{weather.description}</div>
            </div>
          </div>
          <Badge variant="secondary" className={isOptimal ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}>
            {isOptimal ? "Optimal for Growth" : weather.condition}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <Droplets className="h-4 w-4 mx-auto mb-1 text-primary" />
            <div className="text-sm font-medium">{weather.humidity}%</div>
            <div className="text-xs text-muted-foreground">Humidity</div>
          </div>
          <div className="text-center">
            <Wind className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-sm font-medium">{weather.windSpeed} km/h</div>
            <div className="text-xs text-muted-foreground">Wind</div>
          </div>
          <div className="text-center">
            <Thermometer className="h-4 w-4 mx-auto mb-1 text-destructive" />
            <div className="text-sm font-medium">{isOptimal ? "Good" : "Check"}</div>
            <div className="text-xs text-muted-foreground">Conditions</div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {weather.forecast.map((day: any, index: number) => {
              const DayIcon = weatherIcons[day.condition] || CloudSun;
              return (
                <div key={index} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                  <DayIcon className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-xs font-medium">{day.temp}°</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
