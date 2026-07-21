export interface WeatherData {
  temp: number;
  humidity: number;
}

// Fetch weather from keyless Open-Meteo API
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather service status not OK");
    const data = await res.json();
    return {
      temp: data.current.temperature_2m ?? 22,
      humidity: data.current.relative_humidity_2m ?? 50,
    };
  } catch (err) {
    console.warn("Failed to fetch weather, using fallback values:", err);
    return { temp: 22, humidity: 50 }; // fallbacks
  }
}

// Calculate adjusted hydration amount in ml based on Spec
export function calculateHydrationAdjust(temp: number, humidity: number): number {
  let adjust = 0;

  // Temperature adjustment
  if (temp > 22 && temp < 30) {
    adjust += (temp - 22) * 30;
  } else if (temp >= 30) {
    adjust += (temp - 22) * 45;
  }
  // Cap temp adjustment at 800ml
  if (adjust > 800) adjust = 800;

  // Humidity adjustment
  if (humidity < 30) {
    adjust += 200;
  } else if (humidity >= 85 && temp >= 28) {
    adjust += 300;
  }

  return Math.round(adjust);
}

// Generate conversational explanation matching companion tone
export function getWeatherReason(temp: number, humidity: number, companionName: string): string {
  const adjust = calculateHydrationAdjust(temp, humidity);
  if (adjust === 0) {
    return `${companionName} is happy! The weather is comfortable, so stick to your standard base goal. ☀️`;
  }

  let reasons: string[] = [];
  if (temp > 22) {
    reasons.push(temp >= 30 ? "hot weather 🥵" : "warm weather ☀️");
  }
  if (humidity < 30) {
    reasons.push("dry air 🏜️");
  } else if (humidity >= 85 && temp >= 28) {
    reasons.push("humid conditions 💦");
  }

  return `${companionName} suggests drinking +${adjust}ml because of the ${reasons.join(" and ")} today! Keep refreshing!`;
}
