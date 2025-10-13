/**
 * Weather data fetcher using Open-Meteo API
 * Fetches weather data and logs it to the console every minute
 */

interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    precipitation: string;
    weather_code: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
}

interface WeatherConfig {
  latitude: number;
  longitude: number;
  location: string;
}

/**
 * Get weather description based on the weather code
 * @param weatherCode The WMO weather code
 * @returns A human-readable description of the weather
 */
function getWeatherDescription(weatherCode: number): string {
  const weatherCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
  };
  
  return weatherCodes[weatherCode] || "Unknown";
}

/**
 * Fetch weather data from Open-Meteo API
 * @param config Weather configuration with latitude, longitude, and location name
 * @returns Promise with weather data
 */
async function fetchWeatherData(config: WeatherConfig): Promise<WeatherData> {
  const { latitude, longitude } = config;
  
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data: WeatherData = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching weather data: ${error}`);
    throw error;
  }
}

/**
 * Display weather data in a formatted way
 * @param data Weather data from the API
 * @param location Location name to display
 */
function displayWeatherData(data: WeatherData, location: string): void {
  const { current } = data;
  
  const weatherDescription = getWeatherDescription(current.weather_code);
  
  // Get formatted timestamp in local time
  const timestamp = new Date().toLocaleString();
  
  // Clear the console for cleaner output
  console.clear();
  
  console.log(`\n===== Weather Update for ${location} =====`);
  console.log(`Time: ${timestamp}`);
  console.log(`Weather: ${weatherDescription}`);
  console.log(`Temperature: ${current.temperature_2m}°C`);
  console.log(`Feels like: ${current.apparent_temperature}°C`);
  console.log(`Humidity: ${current.relative_humidity_2m}%`);
  console.log(`Precipitation: ${current.precipitation} mm`);
  console.log(`Wind: ${current.wind_speed_10m} km/h, direction: ${current.wind_direction_10m}°`);
  console.log("==========================================\n");
}

/**
 * Main function to fetch and display weather data periodically
 */
async function main() {
  // Default to Tokyo, Japan - change to your preferred location
  const config: WeatherConfig = {
    latitude: 35.6895,
    longitude: 139.6917,
    location: "Tokyo, Japan"
  };
  
  console.log(`Starting weather monitoring for ${config.location}...`);
  
  // Immediately fetch and display data once
  try {
    const data = await fetchWeatherData(config);
    displayWeatherData(data, config.location);
  } catch (error) {
    console.error("Failed to fetch initial weather data.");
  }
  
  // Then set up interval to update every minute
  setInterval(async () => {
    try {
      const data = await fetchWeatherData(config);
      displayWeatherData(data, config.location);
    } catch (error) {
      console.error("Failed to update weather data.");
    }
  }, 60000); // 60000 ms = 1 minute
}

// Start the application
main().catch(error => {
  console.error("Application error:", error);
});