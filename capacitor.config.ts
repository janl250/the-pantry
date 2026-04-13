import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.thepantry',
  appName: 'The Pantry',
  webDir: 'dist',
  server: {
    url: 'https://the-pantry.lovable.app',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'The Pantry'
  }
};

export default config;
