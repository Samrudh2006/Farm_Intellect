import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getWeatherCondition = (code: number) => {
  if (code === 0) return "Clear";
  if (code === 1 || code === 2) return "Partly Cloudy";
  if (code === 3) return "Clouds";
  if (code >= 45 && code <= 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { city } = await req.json();
    
    if (!city) {
      return new Response(JSON.stringify({ error: "City is required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 1. Geocode City Name
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
       return new Response(JSON.stringify({ error: "City not found" }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;
    const locationName = `${location.name}, ${location.country}`;

    // 2. Fetch Weather Data
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto`;
    
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    const current = weatherData.current;
    const daily = weatherData.daily;

    // 3. Format Response for Frontend
    const responseData = {
      location: locationName,
      current: {
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        wind: current.wind_speed_10m,
        condition: getWeatherCondition(current.weather_code),
        description: getWeatherCondition(current.weather_code).toLowerCase()
      },
      forecast: daily.time.map((timeStr: string, index: number) => ({
        date: timeStr,
        tempMax: daily.temperature_2m_max[index],
        tempMin: daily.temperature_2m_min[index],
        condition: getWeatherCondition(daily.weather_code[index]),
        description: getWeatherCondition(daily.weather_code[index]).toLowerCase(),
        rain: daily.precipitation_sum[index],
        wind: daily.wind_speed_10m_max[index]
      }))
    };

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
