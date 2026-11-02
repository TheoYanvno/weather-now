# Weather Now

**▶ [Try it live](https://theoyanvno.github.io/weather-now/)**

Type a city and see the weather right now (temperature, feels like, humidity, wind) and a five-day forecast with highs, lows and the chance of rain. It uses the free [Open-Meteo](https://open-meteo.com/) API, which needs no key.

## How it works

1. The **geocoding API** turns the city name into latitude and longitude.
2. The **forecast API** returns the current weather and daily forecast for those coordinates as JSON.
3. **WMO weather codes** in the response become words and icons through a lookup object.
4. The daily forecast arrives as parallel arrays (`time`, `temperature_2m_max`, …) that line up by index.

## What it shows

- Building request URLs with `URLSearchParams`
- `fetch` with `async` / `await`, and checking `res.ok`
- Reading nested JSON and parallel arrays
- Loading, not-found and network errors with `try` / `catch` / `finally`

## Run it

Open `index.html` in a browser (it needs an internet connection), or use VS Code's Live Server.

Weather data by [Open-Meteo.com](https://open-meteo.com/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

Built with help from AI coding tools, as part of my learning and portfolio.
