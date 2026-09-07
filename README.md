# ArenaTV

Premium, remote-first Android TV IPTV shell built with Vue 3, Capacitor and Tailwind CSS v4.

## Real-data policy

ArenaTV contains no demo credentials, channels, scores, fixtures, or fallback catalog. The home screen is populated only after a successful Xtream Codes login and a sports-provider response.

Football data is modelled behind `SportsProvider`. The included `FootballDataProvider` targets a **server-side proxy** for [Football-Data.org v4](https://www.football-data.org/documentation/api). Keep the provider token in that proxy—never in a browser-exposed `VITE_` variable. Set `VITE_SPORTS_PROXY_URL` to an endpoint that forwards the documented `/matches`, `/matches/:id`, and `/competitions` paths and adds `X-Auth-Token` securely.

Football-Data.org's free plan is rate-limited and may not provide rich lineup or event data. ArenaTV uses a 90-second sports cache and hides unavailable details rather than inventing them.

## Commands

```sh
bun run dev
bun run build
bun run android
```
