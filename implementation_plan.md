# ArenaTV Android TV — Major Update

Extend the existing ArenaTV application with user profiles, auto-login, IndexedDB storage, intelligent channel refresh, responsive TV layout, and performance optimizations — while strictly preserving the existing design system.

## User Review Required

> [!IMPORTANT]
> **Hardcoded credentials will be removed.** The current [LoginPage.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/views/LoginPage.vue#L72-L75) has hardcoded test credentials. These will be removed and replaced with profile-based auto-login.

> [!WARNING]
> **IndexedDB migration.** The current app stores session data in `localStorage` + `@capacitor/preferences`. This plan migrates the IPTV catalog to IndexedDB, but keeps small preferences in `localStorage`/`Preferences`. Existing saved sessions will be auto-migrated to the new profile system on first launch.

> [!IMPORTANT]
> **No new native dependencies.** `@capacitor/preferences` already provides `SharedPreferences` (Android) / `UserDefaults` (iOS) backed storage, which is adequate for securely storing credentials outside the WebView. No additional Capacitor plugins are needed.

## Open Questions

> [!IMPORTANT]
> **Profile avatars:** Should profile avatars be selectable from a predefined set of icons/colors, or should they just use initials with color coding? I'll default to **initials + predefined color palette** to keep it TV-friendly (no file picker needed on TV).

> [!NOTE]
> **VOD and Series data:** The current app only fetches live channels and categories. The IndexedDB schema will include tables for VOD and Series to future-proof the storage, but the implementation will only actively populate `liveChannels` and `liveCategories` for now since the app doesn't have VOD/Series views yet.

---

## Proposed Changes

### Component 1: IndexedDB Storage Layer

New service to replace `localStorage` for large IPTV data. Uses the browser-native IndexedDB API (no additional library needed).

#### [NEW] [db.ts](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/services/db.ts)

A singleton IndexedDB wrapper with typed stores:

```
Database: "arenatv" (version 1)
├── profiles          — IXtreamProfile objects (key: id)
├── liveChannels      — XtreamLiveStream objects (key: stream_id, indexed by: category_id, profileId)
├── liveCategories    — XtreamCategory objects (key: category_id, indexed by: profileId)
├── favorites         — {profileId, streamId, addedAt}
├── recentlyWatched   — {profileId, streamId, watchedAt}
└── cacheMetadata     — {profileId, lastUpdated, channelCount, categoryCount}
```

Key methods:
- `openDatabase()` — open/upgrade the DB
- `putChannels(profileId, channels[])` — batch-write channels via transaction
- `getChannels(profileId)` — retrieve channels for a profile
- `putCategories(profileId, categories[])` — batch-write categories
- `getCategories(profileId)` — retrieve categories for a profile
- `getCacheMetadata(profileId)` — get last refresh timestamp
- `clearProfileData(profileId)` — delete all data for a profile
- `diffChannels(profileId, newChannels[])` — compare cached vs new channels, return `{added, removed, updated, unchanged}` counts

---

### Component 2: Profile System

#### [NEW] [index.ts (types)](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/types/index.ts) — extended

Add new types:

```ts
interface IXtreamProfile {
  id: string                    // crypto.randomUUID()
  name: string                  // user-chosen display name
  serverUrl: string
  username: string
  avatarColor: string           // hex color from predefined palette
  avatarInitial: string         // first letter of name
  isDefault: boolean
  lastLoginStatus: 'connected' | 'expired' | 'failed' | 'never'
  lastLoginAt: string | null    // ISO timestamp
  createdAt: string
}
```

Password stored separately via `@capacitor/preferences` keyed by `arenatv.profile.password.{id}`.

#### [NEW] [profiles.ts](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/stores/profiles.ts)

Pinia store managing profile CRUD:

- `profiles` — ref array of `IXtreamProfile`
- `activeProfileId` — current active profile (persisted in `localStorage`)
- `defaultProfileId` — auto-login profile (persisted in `localStorage`)
- `createProfile(data)` — create and save to IndexedDB
- `updateProfile(id, data)` — edit profile
- `deleteProfile(id)` — remove profile + its cached data + password
- `setDefault(id)` — mark a profile as default
- `switchProfile(id)` — switch active profile, load its cached data
- `getPassword(id)` — read from `Preferences`
- `setPassword(id, password)` — write to `Preferences`
- `loadProfiles()` — load all profiles from IndexedDB on app init
- `migrateFromLegacy()` — auto-migrate existing `arenatv.session.v2` + `arenatv.password.v2` data into a new profile

#### [MODIFY] [xtream.ts](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/stores/xtream.ts)

Refactor to work with profiles:

- `initializeSession()` → load active profile, attempt auto-login with cached credentials
- `login()` → now accepts an optional `profileId` parameter; on success, updates the profile's status and caches data to IndexedDB
- `refreshLibrary()` → loads from IndexedDB cache first, then fetches from API with intelligent diff
- `persist()` → saves to IndexedDB instead of localStorage for catalog data
- `loadStoredSession()` → reads from profile store
- Remove direct localStorage writes for session/catalog data
- Keep `liveStreams` and `categories` as in-memory refs (loaded from IndexedDB on init, refreshed from API)

#### [MODIFY] [useXtream.ts](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/composables/useXtream.ts)

Expose new profile-related methods and the `refreshChannels()` action.

---

### Component 3: Profile UI

#### [NEW] [ProfileSelectorPage.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/views/ProfileSelectorPage.vue)

Full-screen TV-friendly profile selector shown on startup when multiple profiles exist and no default is set:

- Large profile avatar circles in a horizontal row
- Glassmorphism card per profile
- Profile name, connection status, last used time
- `[+ Add Profile]` card at the end
- Lime focus ring on the currently focused profile
- Spatial navigation support
- On select → switch to that profile and auto-login

#### [NEW] [ProfileManagerPage.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/views/ProfileManagerPage.vue)

Settings sub-page for full profile management (create, edit, delete, set default). Accessible from Settings in the header. This is where credential entry happens for new profiles.

- List of profiles as glass cards
- Each card shows: avatar, name, server URL (masked), status, last login
- Actions: Edit, Delete, Set as Default
- Add Profile form at the bottom
- All TV-remote navigable

#### [NEW] [SettingsPage.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/views/SettingsPage.vue)

New settings page with sections:

- **Profiles** → links to ProfileManagerPage
- **IPTV Library** → "Update Channels" button, cache info
- **Account** → current profile info, logout button
- **About** → app version

---

### Component 4: Auto-Login Flow

#### [MODIFY] [App.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/App.vue)

New startup flow:

```
App mounted
  → profileStore.loadProfiles()
  → profileStore.migrateFromLegacy() (if legacy data exists)
  → if defaultProfile exists:
      → attempt auto-login with cached credentials
      → success → router.push('/home')
      → failure → show error modal with [RETRY] [SWITCH PROFILE] [LOGIN AGAIN]
  → if multiple profiles, no default:
      → router.push('/profiles')
  → if no profiles:
      → router.push('/login')
```

#### [MODIFY] [LoginPage.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/views/LoginPage.vue)

- Remove hardcoded credentials
- On successful login, create a profile (or update existing) and save to IndexedDB
- Option to "Save as profile" with a name field
- Redirect to `/home` on success

#### [MODIFY] [router/index.ts](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/router/index.ts)

Add new routes:

```ts
{ path: '/profiles', name: 'profiles', component: ProfileSelectorPage }
{ path: '/settings', name: 'settings', component: SettingsPage }
{ path: '/settings/profiles', name: 'profile-manager', component: ProfileManagerPage }
```

Change default redirect from `/login` to `/` (handled by App.vue logic).

---

### Component 5: Intelligent Channel Refresh

#### [MODIFY] [xtream.ts](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/stores/xtream.ts)

New `refreshChannels()` method:

1. Keep authenticated (no re-login)
2. Fetch latest channels + categories from API
3. Call `db.diffChannels()` to compute `{added, removed, updated, unchanged}`
4. Update IndexedDB with new data
5. Update in-memory `liveStreams` and `categories` refs
6. Preserve favorites (stored separately in IndexedDB)
7. Preserve recently watched (stored separately in IndexedDB)
8. Return real diff statistics for UI display
9. Emit reactive progress state: `refreshProgress: { status, channelsFound, newCount, removedCount, updatedCount }`

#### [NEW] [ChannelRefreshModal.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/components/common/ChannelRefreshModal.vue)

Modal showing real-time refresh progress:

```
Updating your IPTV library...

1,248 channels found     ✓
32 new channels
14 removed
18 updated

Update complete
```

Triggered from Settings page and optionally from the Channels page header.

---

### Component 6: TV-Responsive Layout

#### [MODIFY] [main.css](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/assets/main.css)

Add responsive TV utilities:

```css
/* TV-safe area padding */
.tv-safe { padding: 3vh 3vw; }

/* Responsive typography scale */
@media (min-width: 1920px) { /* 4K scaling */ }
@media (max-width: 1280px) { /* 720p adjustments */ }

/* TV-safe margins */
.tv-margin { margin: 2.5vh 3vw; }
```

Key responsive breakpoints:
- `≤1280px` (720p) — smaller cards, reduced grid columns, tighter spacing
- `1281–1920px` (1080p) — current default
- `>1920px` (1440p/4K) — larger cards, more grid columns, bigger typography

#### [MODIFY] [HomePage.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/views/HomePage.vue)

- Hero section: responsive text sizing (`text-4xl` on 720p → `text-6xl` on 4K)
- Match cards grid: `grid-cols-2` on 720p → `grid-cols-3` on 1080p → `grid-cols-4` on 4K
- TV-safe margins throughout
- Skeleton loaders for initial load

#### [MODIFY] [ChannelsPage.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/views/ChannelsPage.vue)

- Channel grid: responsive columns
- "Update Channels" button in the header area
- TV-safe padding
- Virtual scrolling sentinel already exists — enhance with better batch sizing

#### [MODIFY] [AppHeader.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/components/common/AppHeader.vue)

- Add "Settings" nav link
- Add profile indicator (avatar + name) in the navbar-end area
- Responsive sizing
- TV-safe horizontal padding

---

### Component 7: Enhanced Spatial Navigation & Focus

#### [MODIFY] [useSpatialNav.ts](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/composables/useSpatialNav.ts)

Enhancements:

- **Focus persistence:** Store last focused element's data attribute per route in a `Map<string, string>`. On route enter, restore focus to the previously focused element.
- **Focus group support:** Add `data-nav-group` attribute support so focus stays within logical groups (e.g., category bar, channel grid) before crossing boundaries.
- **Smooth scroll on focus:** Already exists with `scrollIntoView` — keep as is.

#### [MODIFY] [main.css](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/assets/main.css)

Enhance focus styles:

```css
/* Existing focus-visible already has lime glow — keep it */
/* Add subtle scale + glass elevation for focused cards */
.glass:focus-visible {
  border-color: var(--lime);
  box-shadow: 0 0 0 3px var(--lime), 0 0 24px rgba(201,255,74,0.15);
  transform: scale(1.02);
}
```

---

### Component 8: Loading & Error States

#### [NEW] [SkeletonCard.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/components/common/SkeletonCard.vue)

Reusable skeleton loader matching the glass card style. Used in HomePage and ChannelsPage during initial data load.

#### [NEW] [ErrorModal.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/components/common/ErrorModal.vue)

Reusable TV-friendly error modal:

```
[Icon]
Unable to update channels

The IPTV server could not be reached.

[ TRY AGAIN ]  [ CANCEL ]
```

Consistent glassmorphism styling, remote-navigable.

#### [NEW] [SessionExpiredModal.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/components/common/SessionExpiredModal.vue)

Shown when auto-login fails:

```
Session expired

Your IPTV account could not be connected.

[ RETRY ]  [ SWITCH PROFILE ]  [ LOGIN AGAIN ]
```

---

### Component 9: Performance Optimizations

#### [MODIFY] [ChannelsPage.vue](file:///c:/Users/dadem/Desktop/DEV/ArenaTV/src/views/ChannelsPage.vue)

- **Debounced search:** Add 250ms debounce to the search input instead of live filtering on every keystroke
- **Channel logo handling:** Already uses `loading="lazy"` and `@error` fallback — keep as is. Add `referrerpolicy="no-referrer"` (already present).
- **Image error fallback:** On broken logo, show the icon fallback (already handled) — ensure the hidden image doesn't re-request.

#### General performance:

- IndexedDB reads are async — show skeleton loaders while loading
- `channelGroups` computed is expensive with many channels — add `shallowRef` for `liveStreams` array to avoid deep reactivity
- Use `markRaw` for individual stream objects since they don't need deep reactivity
- Debounce search in ChannelsPage
- Keep the existing IntersectionObserver lazy-loading for category groups

---

## File Summary

| Action | File | Purpose |
|--------|------|---------|
| **NEW** | `src/services/db.ts` | IndexedDB wrapper for IPTV data |
| **NEW** | `src/stores/profiles.ts` | Profile CRUD Pinia store |
| **NEW** | `src/types/index.ts` | Extended with profile types |
| **NEW** | `src/views/ProfileSelectorPage.vue` | TV profile selector |
| **NEW** | `src/views/ProfileManagerPage.vue` | Profile management page |
| **NEW** | `src/views/SettingsPage.vue` | Settings page |
| **NEW** | `src/components/common/ChannelRefreshModal.vue` | Refresh progress modal |
| **NEW** | `src/components/common/SkeletonCard.vue` | Skeleton loader |
| **NEW** | `src/components/common/ErrorModal.vue` | Error modal |
| **NEW** | `src/components/common/SessionExpiredModal.vue` | Session expired modal |
| **MODIFY** | `src/stores/xtream.ts` | Profile-aware, IndexedDB backed |
| **MODIFY** | `src/composables/useXtream.ts` | Expose new methods |
| **MODIFY** | `src/composables/useSpatialNav.ts` | Focus persistence |
| **MODIFY** | `src/views/LoginPage.vue` | Profile creation on login |
| **MODIFY** | `src/views/HomePage.vue` | Responsive + skeletons |
| **MODIFY** | `src/views/ChannelsPage.vue` | Responsive + refresh + debounce |
| **MODIFY** | `src/components/common/AppHeader.vue` | Settings link + profile indicator |
| **MODIFY** | `src/router/index.ts` | New routes |
| **MODIFY** | `src/App.vue` | Auto-login flow |
| **MODIFY** | `src/assets/main.css` | TV-responsive + focus + safe area |
| **MODIFY** | `index.html` | Title fix |

---

## Verification Plan

### Automated Tests

```bash
# Type checking
bun run type-check

# Build verification
bun run build-only
```

### Manual Verification

1. **Profile CRUD:** Create, edit, delete, switch, set default profiles
2. **Auto-login:** Close and reopen app — should auto-login with default profile
3. **Session expired:** Test with invalid credentials — should show error modal
4. **Channel refresh:** Trigger from Settings and verify diff statistics
5. **IndexedDB:** Verify no `localStorage` quota errors with large catalogs
6. **Responsive layout:** Test at 1280×720, 1920×1080, 2560×1440, 3840×2160 viewports
7. **Spatial navigation:** Navigate all screens with arrow keys + Enter + Back only
8. **Focus persistence:** Navigate Home → Channels → Back — focus should restore
9. **Performance:** Load a large catalog (1000+ channels) and verify smooth scrolling
10. **Legacy migration:** Verify existing session data migrates to a new profile
