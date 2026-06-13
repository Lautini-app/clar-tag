// Open-Meteo weather lookup — no API key needed.
// Default location: Zürich (47.37, 8.54). User can grant geolocation.

export type WeatherSnapshot = {
  temperature: number;
  code: number;
  description: string;
  isDay: boolean;
};

function describe(code: number): string {
  if ([0].includes(code)) return "klar";
  if ([1, 2].includes(code)) return "leicht bewölkt";
  if ([3].includes(code)) return "bewölkt";
  if ([45, 48].includes(code)) return "neblig";
  if ([51, 53, 55, 56, 57].includes(code)) return "nieselt";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "regnet";
  if ([66, 67].includes(code)) return "gefrierender Regen";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "schneit";
  if ([95, 96, 99].includes(code)) return "Gewitter";
  return "wechselhaft";
}

async function getCoords(): Promise<{ lat: number; lon: number }> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { lat: 47.37, lon: 8.54 };
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve({ lat: 47.37, lon: 8.54 }), 3000);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        clearTimeout(timeout);
        resolve({ lat: 47.37, lon: 8.54 });
      },
      { timeout: 2500, maximumAge: 600000 },
    );
  });
}

export async function fetchWeather(): Promise<WeatherSnapshot | null> {
  try {
    const { lat, lon } = await getCoords();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const c = json.current;
    return {
      temperature: Math.round(c.temperature_2m),
      code: c.weather_code,
      description: describe(c.weather_code),
      isDay: c.is_day === 1,
    };
  } catch {
    return null;
  }
}

export function tempBand(t: number): "cold" | "cool" | "mild" | "warm" | "hot" {
  if (t < 5) return "cold";
  if (t < 12) return "cool";
  if (t < 18) return "mild";
  if (t < 25) return "warm";
  return "hot";
}
