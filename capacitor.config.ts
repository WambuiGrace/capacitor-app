import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.notes.app',
  appName: 'capacitor-app',
  webDir: 'public',
  server: { 
    url: 'http://localhost:3000'
  }
};

export default config;
