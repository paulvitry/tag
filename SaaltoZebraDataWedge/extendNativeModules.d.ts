// import original module declarations
import 'react-native';
import ReactNative from 'react-native';

export interface SaaltoZebraDataWedgeInterface
  extends ReactNative.NativeModule {
  setupScanner: (
    name: string,
    packageName: string,
    activity: string,
    torch: boolean,
  ) => Promise<void>;
  disposeScanner: () => Promise<void>;
  getVersion: () => Promise<void>;
  toggleScan: (enable: boolean) => Promise<void>;
}

// and extend them!
declare module 'react-native' {
  interface NativeModulesStatic {
    SaaltoZebraDataWedge: SaaltoZebraDataWedgeInterface;
  }
}
