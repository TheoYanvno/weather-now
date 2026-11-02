const form = document.getElementById('searchForm');
const cityInput = document.getElementById('city');
const status = document.getElementById('status');
const currentBox = document.getElementById('current');
const forecastList = document.getElementById('forecast');

// The two endpoints this app uses.
const GEO = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST = 'https://api.open-meteo.com/v1/forecast';

// Builds a full request URL: the endpoint, then ?name=value&name=value.
function url(endpoint, params) {
  return `${endpoint}?${new URLSearchParams(params)}`;
}

// Get a URL and read its JSON, or throw if the server answered with an error.
async function getJSON(address) {
  const res = await fetch(address);
  if (!res.ok) throw new Error(`The weather service answered ${res.status}.`);
  return res.json();
}

// Turn a city name into a place with coordinates, or null if nothing matches.
async function findPlace(name) {
  const data = await getJSON(url(GEO, { name, count: 1, language: 'en', format: 'json' }));
  return data.results?.[0] ?? null;
}

// The current weather and a five-day forecast for one place.
async function getWeather(place) {
  return getJSON(url(FORECAST, {
    latitude: place.latitude,
    longitude: place.longitude,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'auto',
    forecast_days: 5,
  }));
}

// WMO weather codes, as used by Open-Meteo: [description, emoji].
const CODES = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Freezing fog', '🌫️'],
  51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌦️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'],
  80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Violent showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Thunderstorm with hail', '⛈️'],
};

function describe(code) {
  return CODES[code] ?? ['Unknown', '❔'];
}

// A small helper: make an element with a class and some text.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// The big card with the weather right now.
function showCurrent(place, data) {
  const c = data.current;
  const u = data.current_units;
  const [label, icon] = describe(c.weather_code);
  const where = [place.name, place.admin1, place.country].filter(Boolean).join(', ');
  const facts = el('div', 'facts');
  facts.append(
    el('span', '', `Feels like ${Math.round(c.apparent_temperature)}${u.apparent_temperature}`),
    el('span', '', `Humidity ${c.relative_humidity_2m}%`),
    el('span', '', `Wind ${Math.round(c.wind_speed_10m)} ${u.wind_speed_10m}`),
  );
  currentBox.replaceChildren(
    el('h2', '', where),
    el('div', 'icon', icon),
    el('p', 'big', `${Math.round(c.temperature_2m)}${u.temperature_2m}`),
    el('p', '', label),
    facts,
  );
  currentBox.hidden = false;
}

// One card per day: weekday, icon, high and low, chance of rain.
function showForecast(data) {
  const d = data.daily;
  forecastList.replaceChildren(...d.time.map((day, i) => {
    const [label, icon] = describe(d.weather_code[i]);
    const date = new Date(`${day}T12:00`);
    const li = el('li');
    li.title = label;
    li.append(
      el('strong', '', i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })),
      el('div', 'icon', icon),
      el('div', '', `${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°`),
      el('div', 'small', `💧 ${d.precipitation_probability_max[i] ?? 0}%`),
    );
    return li;
  }));
}

const button = form.querySelector('button');

// Find a city, then show its weather. Every failure gets a clear message.
async function search(name) {
  if (!name) {
    status.textContent = 'Type a city name.';
    return;
  }
  status.textContent = 'Loading…';
  button.disabled = true;
  try {
    const place = await findPlace(name);
    if (!place) {
      status.textContent = `No place called "${name}". Check the spelling.`;
      return;
    }
    const data = await getWeather(place);
    showCurrent(place, data);
    showForecast(data);
    status.textContent = '';
  } catch (err) {
    status.textContent = err instanceof TypeError
      ? 'Couldn\'t reach the weather service. Check your connection.'
      : err.message;
  } finally {
    button.disabled = false;
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  search(cityInput.value.trim());
});

search(cityInput.value.trim());
