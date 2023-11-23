import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'spotube',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
