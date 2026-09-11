<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profiles'
import { useSpatialNav } from '@/composables/useSpatialNav'

const router = useRouter()
const profileStore = useProfileStore()
const name = ref('')
const serverUrl = ref('')
const username = ref('')
const password = ref('')
const editingId = ref<string | null>(null)
const formError = ref('')

const profiles = computed(() => profileStore.profiles)

useSpatialNav({ defaultFocusSelector: '#profile-name' })

function resetForm() {
  editingId.value = null
  name.value = ''
  serverUrl.value = ''
  username.value = ''
  password.value = ''
  formError.value = ''
}

async function saveProfile() {
  if (!name.value.trim() || !serverUrl.value.trim() || !username.value.trim() || !password.value.trim()) {
    formError.value = 'Please complete every field before saving a profile.'
    return
  }

  try {
    if (editingId.value) {
      await profileStore.updateProfile(editingId.value, {
        name: name.value.trim(),
        serverUrl: serverUrl.value.trim(),
        username: username.value.trim(),
        password: password.value,
      })
    } else {
      await profileStore.createProfile({
        name: name.value.trim(),
        serverUrl: serverUrl.value.trim(),
        username: username.value.trim(),
        password: password.value,
      })
    }
    resetForm()
  } catch {
    formError.value = 'Could not save this profile.'
  }
}

async function setDefault(id: string) {
  await profileStore.setDefault(id)
}

function editProfile(profile: { id: string; name: string; serverUrl: string; username: string }) {
  editingId.value = profile.id
  name.value = profile.name
  serverUrl.value = profile.serverUrl
  username.value = profile.username
  password.value = ''
  formError.value = ''
}

async function deleteProfile(id: string) {
  if (profileStore.profiles.length <= 1) {
    formError.value = 'Keep at least one profile available.'
    return
  }
  await profileStore.deleteProfileById(id)
}
</script>

<template>
  <main class="tv-safe min-h-screen bg-[#080a08] py-10 text-white">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.22em] text-primary">Profiles</p>
          <h1 class="mt-2 text-4xl font-black tracking-[-0.05em]">Manage your accounts</h1>
        </div>
        <button tabindex="0" @click="router.push('/settings')" class="btn btn-ghost text-white/70">
          Back to settings
        </button>
      </div>

      <div class="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section class="space-y-4">
          <button
            v-for="profile in profiles"
            :key="profile.id"
            tabindex="0"
            class="glass flex w-full items-center justify-between rounded-[1.3rem] border border-white/10 p-4 text-left"
            :class="profileStore.defaultProfileId === profile.id ? 'border-primary/50' : ''"
          >
            <div class="flex items-center gap-4">
              <span
                class="flex size-12 items-center justify-center rounded-full text-lg font-black"
                :style="{ backgroundColor: profile.avatarColor, color: '#08110b' }"
              >
                {{ profile.avatarInitial }}
              </span>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-xl font-black">{{ profile.name }}</h2>
                  <span
                    v-if="profileStore.defaultProfileId === profile.id"
                    class="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary"
                  >
                    Default
                  </span>
                </div>
                <p class="mt-1 text-xs uppercase tracking-[0.15em] text-white/45">{{ profile.username }}</p>
                <p class="mt-2 text-sm text-white/60">{{ profile.serverUrl }}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button tabindex="0" @click.stop="editProfile(profile)" class="btn btn-ghost btn-sm text-white/70">Edit</button>
              <button tabindex="0" @click.stop="setDefault(profile.id)" class="btn btn-primary btn-sm">Set default</button>
              <button tabindex="0" @click.stop="deleteProfile(profile.id)" class="btn btn-ghost btn-sm text-red-200">Delete</button>
            </div>
          </button>
        </section>

        <aside class="glass rounded-[1.5rem] border border-white/10 p-5">
          <h2 class="text-2xl font-black tracking-[-0.04em]">{{ editingId ? 'Edit profile' : 'Add profile' }}</h2>
          <div class="mt-5 space-y-4">
            <input id="profile-name" v-model="name" class="input input-primary w-full" placeholder="Display name" />
            <input v-model="serverUrl" class="input input-primary w-full" placeholder="https://provider.example:8080" />
            <input v-model="username" class="input input-primary w-full" placeholder="Username" />
            <input v-model="password" type="password" class="input input-primary w-full" placeholder="Password" />

            <p v-if="formError" class="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
              {{ formError }}
            </p>

            <div class="flex gap-3">
              <button tabindex="0" @click="saveProfile" class="btn btn-primary flex-1">{{ editingId ? 'Save changes' : 'Create profile' }}</button>
              <button tabindex="0" @click="resetForm" class="btn btn-ghost flex-1">Clear</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>
