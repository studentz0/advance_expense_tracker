import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.financeapp.tracker',
  appName: 'Finance Tracker',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
