import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import ChannelsPage from '@/views/ChannelsPage.vue'
import HomePage from '@/views/HomePage.vue'
import ProfileSelectorPage from '@/views/ProfileSelectorPage.vue'
import SettingsPage from '@/views/SettingsPage.vue'
import ProfileManagerPage from '@/views/ProfileManagerPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/profiles',
      name: 'profiles',
      component: ProfileSelectorPage,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsPage,
    },
    {
      path: '/settings/profiles',
      name: 'profile-manager',
      component: ProfileManagerPage,
    },
    {
      path: '/home',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/channels',
      name: 'channels',
      component: ChannelsPage,
    },
  ],
})

export default router
