import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "MyApp",
  webDir: "www",
  server: {
    androidScheme: "https",
    allowNavigation: ["*"],
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
  cordova: {}
};
export default config;
