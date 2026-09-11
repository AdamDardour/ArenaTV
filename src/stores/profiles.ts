import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'
import type { IXtreamProfile, ProfileLoginStatus } from '@/types'
import { PROFILE_COLORS } from '@/types'
import * as db from '@/services/db'

const ACTIVE_PROFILE_KEY = 'arenatv.activeProfileId'
const DEFAULT_PROFILE_KEY = 'arenatv.defaultProfileId'
const LEGACY_SESSION_KEY = 'arenatv.session.v2'
const LEGACY_PASSWORD_KEY = 'arenatv.password.v2'

function passwordKey(profileId: string) {
  return `arenatv.profile.password.${profileId}`
}

export const useProfileStore = defineStore('profiles', () => {
  const profiles = ref<IXtreamProfile[]>([])
  const activeProfileId = ref<string | null>(null)
  const defaultProfileId = ref<string | null>(null)
  const loaded = ref(false)

  const activeProfile = computed(() =>
    profiles.value.find((p) => p.id === activeProfileId.value) || null,
  )

  const defaultProfile = computed(() =>
    profiles.value.find((p) => p.id === defaultProfileId.value) || null,
  )

  // ── Load profiles from IndexedDB ────────────────────────────
  async function loadProfiles() {
    profiles.value = await db.getAllProfiles()
    activeProfileId.value = localStorage.getItem(ACTIVE_PROFILE_KEY)
    defaultProfileId.value = localStorage.getItem(DEFAULT_PROFILE_KEY)
    loaded.value = true
  }

  // ── CRUD ────────────────────────────────────────────────────
  async function createProfile(data: {
    name: string
    serverUrl: string
    username: string
    password: string
  }): Promise<IXtreamProfile> {
    const id = crypto.randomUUID()
    const colorIndex = profiles.value.length % PROFILE_COLORS.length
    const profile: IXtreamProfile = {
      id,
      name: data.name,
      serverUrl: data.serverUrl,
      username: data.username,
      avatarColor: PROFILE_COLORS[colorIndex]!,
      avatarInitial: (data.name[0] || 'P').toUpperCase(),
      isDefault: profiles.value.length === 0, // first profile is default
      lastLoginStatus: 'never',
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
    }

    await db.putProfile(profile)
    await Preferences.set({ key: passwordKey(id), value: data.password })

    profiles.value = [...profiles.value, profile]

    // First profile becomes default and active
    if (profile.isDefault) {
      defaultProfileId.value = id
      localStorage.setItem(DEFAULT_PROFILE_KEY, id)
    }

    return profile
  }

  async function updateProfile(
    id: string,
    data: Partial<Pick<IXtreamProfile, 'name' | 'serverUrl' | 'username'>> & { password?: string },
  ) {
    const profile = profiles.value.find((p) => p.id === id)
    if (!profile) return

    if (data.name !== undefined) {
      profile.name = data.name
      profile.avatarInitial = (data.name[0] || 'P').toUpperCase()
    }
    if (data.serverUrl !== undefined) profile.serverUrl = data.serverUrl
    if (data.username !== undefined) profile.username = data.username
    if (data.password !== undefined) {
      await Preferences.set({ key: passwordKey(id), value: data.password })
    }

    await db.putProfile({ ...profile })
    profiles.value = [...profiles.value]
  }

  async function deleteProfileById(id: string) {
    await db.deleteProfile(id)
    await Preferences.remove({ key: passwordKey(id) })

    profiles.value = profiles.value.filter((p) => p.id !== id)

    if (activeProfileId.value === id) {
      activeProfileId.value = null
      localStorage.removeItem(ACTIVE_PROFILE_KEY)
    }
    if (defaultProfileId.value === id) {
      defaultProfileId.value = null
      localStorage.removeItem(DEFAULT_PROFILE_KEY)
      // If there's exactly one profile left, make it default
      if (profiles.value.length === 1 && profiles.value[0]) {
        await setDefault(profiles.value[0].id)
      }
    }
  }

  async function setDefault(id: string) {
    // Remove default from all
    for (const p of profiles.value) {
      if (p.isDefault) {
        p.isDefault = false
        await db.putProfile({ ...p })
      }
    }

    const profile = profiles.value.find((p) => p.id === id)
    if (profile) {
      profile.isDefault = true
      await db.putProfile({ ...profile })
    }

    defaultProfileId.value = id
    localStorage.setItem(DEFAULT_PROFILE_KEY, id)
    profiles.value = [...profiles.value]
  }

  function setActive(id: string) {
    activeProfileId.value = id
    localStorage.setItem(ACTIVE_PROFILE_KEY, id)
  }

  async function updateLoginStatus(id: string, status: ProfileLoginStatus) {
    const profile = profiles.value.find((p) => p.id === id)
    if (!profile) return

    profile.lastLoginStatus = status
    if (status === 'connected') {
      profile.lastLoginAt = new Date().toISOString()
    }
    await db.putProfile({ ...profile })
    profiles.value = [...profiles.value]
  }

  // ── Password access ─────────────────────────────────────────
  async function getPassword(id: string): Promise<string> {
    const result = await Preferences.get({ key: passwordKey(id) })
    return result.value || ''
  }

  // ── Migrate legacy session data ─────────────────────────────
  async function migrateFromLegacy(): Promise<IXtreamProfile | null> {
    try {
      const raw = localStorage.getItem(LEGACY_SESSION_KEY)
      if (!raw) return null

      const session = JSON.parse(raw)
      if (!session.serverUrl || !session.username) return null

      const legacyPassword = await Preferences.get({ key: LEGACY_PASSWORD_KEY })
      if (!legacyPassword.value) return null

      // Check if a profile already exists with these credentials
      const existing = profiles.value.find(
        (p) => p.serverUrl === session.serverUrl && p.username === session.username,
      )
      if (existing) {
        // Clean up legacy data
        localStorage.removeItem(LEGACY_SESSION_KEY)
        await Preferences.remove({ key: LEGACY_PASSWORD_KEY })
        return existing
      }

      // Create a new profile from legacy data
      const profile = await createProfile({
        name: session.username,
        serverUrl: session.serverUrl,
        username: session.username,
        password: legacyPassword.value,
      })

      // Clean up legacy data
      localStorage.removeItem(LEGACY_SESSION_KEY)
      await Preferences.remove({ key: LEGACY_PASSWORD_KEY })

      return profile
    } catch {
      return null
    }
  }

  return {
    profiles,
    activeProfileId,
    defaultProfileId,
    activeProfile,
    defaultProfile,
    loaded,
    loadProfiles,
    createProfile,
    updateProfile,
    deleteProfileById,
    setDefault,
    setActive,
    updateLoginStatus,
    getPassword,
    migrateFromLegacy,
  }
})
