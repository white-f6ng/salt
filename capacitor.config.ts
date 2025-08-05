import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

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
    Keyboard: {
      resize: KeyboardResize.Ionic,
      style: KeyboardStyle.Dark,
      resizeOnFullScreen: true
    }
  },
  cordova: {}
};
export default config;
