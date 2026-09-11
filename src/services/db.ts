import type { IXtreamProfile, RefreshResult, XtreamCategory, XtreamLiveStream } from '@/types'

const DB_NAME = 'arenatv'
const DB_VERSION = 1

// Store names
const PROFILES = 'profiles'
const LIVE_CHANNELS = 'liveChannels'
const LIVE_CATEGORIES = 'liveCategories'
const FAVORITES = 'favorites'
const RECENTLY_WATCHED = 'recentlyWatched'
const CACHE_META = 'cacheMetadata'

export interface CacheMetadata {
  profileId: string
  lastUpdated: string
  channelCount: number
  categoryCount: number
}

export interface FavoriteEntry {
  id: string // `${profileId}:${streamId}`
  profileId: string
  streamId: string | number
  addedAt: string
}

export interface RecentEntry {
  id: string // `${profileId}:${streamId}`
  profileId: string
  streamId: string | number
  watchedAt: string
}

// Channels stored with a composite key for multi-profile support
interface StoredChannel extends XtreamLiveStream {
  _profileId: string
  _key: string // `${profileId}:${stream_id}`
}

interface StoredCategory extends XtreamCategory {
  _profileId: string
  _key: string // `${profileId}:${category_id}`
}

let dbInstance: IDBDatabase | null = null

function open(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      // Profiles store
      if (!db.objectStoreNames.contains(PROFILES)) {
        db.createObjectStore(PROFILES, { keyPath: 'id' })
      }

      // Live channels — composite key per profile
      if (!db.objectStoreNames.contains(LIVE_CHANNELS)) {
        const store = db.createObjectStore(LIVE_CHANNELS, { keyPath: '_key' })
        store.createIndex('profileId', '_profileId', { unique: false })
        store.createIndex('categoryId', 'category_id', { unique: false })
      }

      // Live categories
      if (!db.objectStoreNames.contains(LIVE_CATEGORIES)) {
        const store = db.createObjectStore(LIVE_CATEGORIES, { keyPath: '_key' })
        store.createIndex('profileId', '_profileId', { unique: false })
      }

      // Favorites
      if (!db.objectStoreNames.contains(FAVORITES)) {
        const store = db.createObjectStore(FAVORITES, { keyPath: 'id' })
        store.createIndex('profileId', 'profileId', { unique: false })
      }

      // Recently watched
      if (!db.objectStoreNames.contains(RECENTLY_WATCHED)) {
        const store = db.createObjectStore(RECENTLY_WATCHED, { keyPath: 'id' })
        store.createIndex('profileId', 'profileId', { unique: false })
      }

      // Cache metadata
      if (!db.objectStoreNames.contains(CACHE_META)) {
        db.createObjectStore(CACHE_META, { keyPath: 'profileId' })
      }
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }
    request.onerror = () => reject(request.error)
  })
}

// ── Generic helpers ─────────────────────────────────────────────

function tx(
  storeNames: string | string[],
  mode: IDBTransactionMode,
): Promise<{ transaction: IDBTransaction; stores: Record<string, IDBObjectStore> }> {
  return open().then((db) => {
    const names = Array.isArray(storeNames) ? storeNames : [storeNames]
    const transaction = db.transaction(names, mode)
    const stores: Record<string, IDBObjectStore> = {}
    for (const name of names) stores[name] = transaction.objectStore(name)
    return { transaction, stores }
  })
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function awaitTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

// ── Profiles ────────────────────────────────────────────────────

export async function getAllProfiles(): Promise<IXtreamProfile[]> {
  const { stores } = await tx(PROFILES, 'readonly')
  return promisify(stores[PROFILES]!.getAll())
}

export async function getProfile(id: string): Promise<IXtreamProfile | undefined> {
  const { stores } = await tx(PROFILES, 'readonly')
  return promisify(stores[PROFILES]!.get(id))
}

export async function putProfile(profile: IXtreamProfile): Promise<void> {
  const { transaction, stores } = await tx(PROFILES, 'readwrite')
  stores[PROFILES]!.put(profile)
  return awaitTransaction(transaction)
}

export async function deleteProfile(id: string): Promise<void> {
  const { transaction, stores } = await tx(
    [PROFILES, LIVE_CHANNELS, LIVE_CATEGORIES, FAVORITES, RECENTLY_WATCHED, CACHE_META],
    'readwrite',
  )
  stores[PROFILES]!.delete(id)

  // Delete all associated data
  const channelIndex = stores[LIVE_CHANNELS]!.index('profileId')
  const categoryIndex = stores[LIVE_CATEGORIES]!.index('profileId')
  const favIndex = stores[FAVORITES]!.index('profileId')
  const recentIndex = stores[RECENTLY_WATCHED]!.index('profileId')

  for (const index of [channelIndex, categoryIndex, favIndex, recentIndex]) {
    const cursor = index.openCursor(IDBKeyRange.only(id))
    await new Promise<void>((resolve, reject) => {
      cursor.onsuccess = () => {
        const c = cursor.result
        if (c) {
          c.delete()
          c.continue()
        } else {
          resolve()
        }
      }
      cursor.onerror = () => reject(cursor.error)
    })
  }

  stores[CACHE_META]!.delete(id)
  return awaitTransaction(transaction)
}

// ── Channels ────────────────────────────────────────────────────

export async function getChannels(profileId: string): Promise<XtreamLiveStream[]> {
  const { stores } = await tx(LIVE_CHANNELS, 'readonly')
  const index = stores[LIVE_CHANNELS]!.index('profileId')
  const results: StoredChannel[] = await promisify(index.getAll(IDBKeyRange.only(profileId)))
  // Strip internal keys before returning
  return results.map(({ _profileId: _, _key: _k, ...channel }) => channel as XtreamLiveStream)
}

export async function putChannels(
  profileId: string,
  channels: XtreamLiveStream[],
): Promise<void> {
  const { transaction, stores } = await tx(LIVE_CHANNELS, 'readwrite')
  const store = stores[LIVE_CHANNELS]!

  // Clear existing channels for this profile first
  const index = store.index('profileId')
  const existingKeys: IDBValidKey[] = await promisify(index.getAllKeys(IDBKeyRange.only(profileId)))
  for (const key of existingKeys) store.delete(key)

  // Write new channels
  for (const channel of channels) {
    const stored: StoredChannel = {
      ...channel,
      _profileId: profileId,
      _key: `${profileId}:${channel.stream_id}`,
    }
    store.put(stored)
  }

  return awaitTransaction(transaction)
}

// ── Categories ──────────────────────────────────────────────────

export async function getCategories(profileId: string): Promise<XtreamCategory[]> {
  const { stores } = await tx(LIVE_CATEGORIES, 'readonly')
  const index = stores[LIVE_CATEGORIES]!.index('profileId')
  const results: StoredCategory[] = await promisify(index.getAll(IDBKeyRange.only(profileId)))
  return results.map(({ _profileId: _, _key: _k, ...cat }) => cat as XtreamCategory)
}

export async function putCategories(
  profileId: string,
  categories: XtreamCategory[],
): Promise<void> {
  const { transaction, stores } = await tx(LIVE_CATEGORIES, 'readwrite')
  const store = stores[LIVE_CATEGORIES]!

  // Clear existing
  const index = store.index('profileId')
  const existingKeys: IDBValidKey[] = await promisify(index.getAllKeys(IDBKeyRange.only(profileId)))
  for (const key of existingKeys) store.delete(key)

  // Write new
  for (const cat of categories) {
    const stored: StoredCategory = {
      ...cat,
      _profileId: profileId,
      _key: `${profileId}:${cat.category_id}`,
    }
    store.put(stored)
  }

  return awaitTransaction(transaction)
}

// ── Cache metadata ──────────────────────────────────────────────

export async function getCacheMetadata(profileId: string): Promise<CacheMetadata | undefined> {
  const { stores } = await tx(CACHE_META, 'readonly')
  return promisify(stores[CACHE_META]!.get(profileId))
}

export async function putCacheMetadata(meta: CacheMetadata): Promise<void> {
  const { transaction, stores } = await tx(CACHE_META, 'readwrite')
  stores[CACHE_META]!.put(meta)
  return awaitTransaction(transaction)
}

// ── Favorites ───────────────────────────────────────────────────

export async function getFavorites(profileId: string): Promise<FavoriteEntry[]> {
  const { stores } = await tx(FAVORITES, 'readonly')
  const index = stores[FAVORITES]!.index('profileId')
  return promisify(index.getAll(IDBKeyRange.only(profileId)))
}

export async function addFavorite(profileId: string, streamId: string | number): Promise<void> {
  const { transaction, stores } = await tx(FAVORITES, 'readwrite')
  const entry: FavoriteEntry = {
    id: `${profileId}:${streamId}`,
    profileId,
    streamId,
    addedAt: new Date().toISOString(),
  }
  stores[FAVORITES]!.put(entry)
  return awaitTransaction(transaction)
}

export async function removeFavorite(profileId: string, streamId: string | number): Promise<void> {
  const { transaction, stores } = await tx(FAVORITES, 'readwrite')
  stores[FAVORITES]!.delete(`${profileId}:${streamId}`)
  return awaitTransaction(transaction)
}

// ── Recently watched ────────────────────────────────────────────

export async function getRecentlyWatched(profileId: string): Promise<RecentEntry[]> {
  const { stores } = await tx(RECENTLY_WATCHED, 'readonly')
  const index = stores[RECENTLY_WATCHED]!.index('profileId')
  return promisify(index.getAll(IDBKeyRange.only(profileId)))
}

export async function addRecentlyWatched(
  profileId: string,
  streamId: string | number,
): Promise<void> {
  const { transaction, stores } = await tx(RECENTLY_WATCHED, 'readwrite')
  const entry: RecentEntry = {
    id: `${profileId}:${streamId}`,
    profileId,
    streamId,
    watchedAt: new Date().toISOString(),
  }
  stores[RECENTLY_WATCHED]!.put(entry)
  return awaitTransaction(transaction)
}

// ── Intelligent diff ────────────────────────────────────────────

export async function diffChannels(
  profileId: string,
  incoming: XtreamLiveStream[],
): Promise<RefreshResult> {
  const existing = await getChannels(profileId)
  const existingMap = new Map(existing.map((ch) => [String(ch.stream_id), ch]))
  const incomingMap = new Map(incoming.map((ch) => [String(ch.stream_id), ch]))

  let newCount = 0
  let updatedCount = 0

  for (const [id, channel] of incomingMap) {
    const old = existingMap.get(id)
    if (!old) {
      newCount++
    } else if (old.name !== channel.name || old.category_id !== channel.category_id || old.stream_icon !== channel.stream_icon) {
      updatedCount++
    }
  }

  let removedCount = 0
  for (const id of existingMap.keys()) {
    if (!incomingMap.has(id)) removedCount++
  }

  return {
    channelsFound: incoming.length,
    newCount,
    removedCount,
    updatedCount,
    categoriesFound: 0, // filled by caller
  }
}
