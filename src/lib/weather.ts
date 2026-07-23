export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  condition: string;
  conditionEmoji: string;
}

// WMO Weather Code → Condition mapping
function getWeatherCondition(code: number): { condition: string; emoji: string } {
  if (code === 0) return { condition: "Clear Sky", emoji: "☀️" };
  if (code <= 3) return { condition: "Partly Cloudy", emoji: "⛅" };
  if (code <= 48) return { condition: "Foggy", emoji: "🌫️" };
  if (code <= 55) return { condition: "Light Drizzle", emoji: "🌦️" };
  if (code <= 57) return { condition: "Freezing Drizzle", emoji: "🌧️" };
  if (code <= 65) return { condition: "Rain", emoji: "🌧️" };
  if (code <= 67) return { condition: "Freezing Rain", emoji: "🧊" };
  if (code <= 75) return { condition: "Snow", emoji: "🌨️" };
  if (code <= 77) return { condition: "Snow Grains", emoji: "❄️" };
  if (code <= 82) return { condition: "Rain Showers", emoji: "🌦️" };
  if (code <= 86) return { condition: "Snow Showers", emoji: "🌨️" };
  if (code === 95) return { condition: "Thunderstorm", emoji: "⛈️" };
  if (code <= 99) return { condition: "Thunderstorm w/ Hail", emoji: "⛈️" };
  return { condition: "Unknown", emoji: "🌡️" };
}

// Fetch weather from keyless Open-Meteo API with enhanced fields
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather service status not OK");
    const data = await res.json();
    const code = data.current.weather_code ?? 0;
    const { condition, emoji } = getWeatherCondition(code);
    return {
      temp: data.current.temperature_2m ?? 22,
      feelsLike: data.current.apparent_temperature ?? data.current.temperature_2m ?? 22,
      humidity: data.current.relative_humidity_2m ?? 50,
      windSpeed: data.current.wind_speed_10m ?? 0,
      weatherCode: code,
      condition,
      conditionEmoji: emoji,
    };
  } catch (err) {
    console.warn("Failed to fetch weather, using fallback values:", err);
    return { temp: 22, feelsLike: 22, humidity: 50, windSpeed: 0, weatherCode: 0, condition: "Clear Sky", conditionEmoji: "☀️" };
  }
}

// Calculate personalized daily goal from body metrics
export function calculatePersonalizedGoal(
  weightKg: number,
  gender: string,
  age: number,
  heightCm: number
): number {
  // Base: 30ml per kg of body weight
  let goal = weightKg * 30;

  // Gender adjustment
  if (gender === 'male') goal += 200;

  // Age adjustment (older adults need slightly less)
  if (age > 50) goal -= 200;

  // Height adjustment (taller people need more)
  if (heightCm > 180) goal += 200;

  // Clamp to reasonable range
  return Math.round(Math.max(1500, Math.min(4000, goal)));
}

// Calculate adjusted hydration amount in ml based on feels-like temperature
export function calculateHydrationAdjust(feelsLike: number, humidity: number, weatherCode: number): number {
  let adjust = 0;

  // Feels-like temperature adjustment (more accurate than raw temp)
  if (feelsLike > 22 && feelsLike < 30) {
    adjust += (feelsLike - 22) * 30;
  } else if (feelsLike >= 30 && feelsLike < 35) {
    adjust += (feelsLike - 22) * 45;
  } else if (feelsLike >= 35) {
    // Extreme heat
    adjust += (feelsLike - 22) * 55;
  }
  // Cap temp adjustment at 1000ml
  if (adjust > 1000) adjust = 1000;

  // Humidity adjustment
  if (humidity < 30) {
    // Dry air — increased water loss through skin
    adjust += 200;
  } else if (humidity >= 85 && feelsLike >= 28) {
    // Humid + hot — body can't cool via sweat efficiently
    adjust += 300;
  }

  // Weather condition bonus
  if (weatherCode >= 95) {
    // Thunderstorm — stay safe, extra hydration
    adjust += 100;
  }

  return Math.round(adjust);
}

// Generate conversational explanation matching companion tone
export function getWeatherReason(
  temp: number,
  feelsLike: number,
  humidity: number,
  weatherCode: number,
  companionName: string
): string {
  const adjust = calculateHydrationAdjust(feelsLike, humidity, weatherCode);
  const { condition, emoji } = getWeatherCondition(weatherCode);

  if (adjust === 0) {
    return `${companionName} is happy! ${emoji} ${condition} — the weather is comfortable, so stick to your base goal! ☀️`;
  }

  const reasons: string[] = [];
  if (feelsLike >= 35) {
    reasons.push(`extreme heat (feels like ${Math.round(feelsLike)}°C 🥵)`);
  } else if (feelsLike >= 30) {
    reasons.push(`hot weather (feels like ${Math.round(feelsLike)}°C 🥵)`);
  } else if (feelsLike > 22) {
    reasons.push(`warm weather (feels like ${Math.round(feelsLike)}°C ☀️)`);
  }
  if (humidity < 30) {
    reasons.push("dry air 🏜️");
  } else if (humidity >= 85 && feelsLike >= 28) {
    reasons.push("humid conditions 💦");
  }

  return `${companionName} suggests +${adjust}ml due to ${reasons.join(" and ")}! ${emoji} ${condition} today — stay hydrated!`;
}
