import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.thepantry',
  appName: 'The Pantry',
  webDir: 'dist',
  server: {
    // Remove or comment out for production builds
    // url: 'http://localhost:5173',
    // cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'The Pantry'
  }
};

export default config;
