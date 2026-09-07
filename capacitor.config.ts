import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qalaasoftware.arenatv',
  appName: 'ArenaTV',
  webDir: 'dist',
  backgroundColor: '#070b14',
  android: {
    allowMixedContent: true,
  },
  server: {
    cleartext: true,
    androidScheme: 'http',
  },
};

export default config;
