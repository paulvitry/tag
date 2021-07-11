import {NativeModules} from 'react-native';

const {SaaltoZebraDataWedge} = NativeModules;

export enum DataWedgeEvent {
  FirmwareVersion = 'FirmwareVersion',
  ProfileConfig = 'ProfileConfig',
  DeviceStatus = 'DeviceStatus',
  ScanData = 'ScanData',
}

export enum ProfileConfigResult {
  FAILURE = 'FAILURE',
  SUCCESS = 'SUCCESS',
}

export enum ProfileConfigCode {
  APP_ALREADY_ASSOCIATED = 'APP_ALREADY_ASSOCIATED',
}

export enum DeviceStatus {
  WAITING = 'WAITING',
  SCANNING = 'SCANNING',
  DISABLED = 'DISABLED',
  DISCONNECTED = 'DISCONNECTED',
}

export type FirmwareVersionEvent = {
  DataWedge: string;
  Decoder: string;
  Barcode: string;
  ScannerFirmware: string[];
};

export type ProfileConfigEvent = {
  ErrorCode: string;
  Result: ProfileConfigResult;
};

export type DeviceStatusEvent = {
  Status: DeviceStatus;
  ProfileName: string;
};

export type ScanDataEvent = {
  Source: string;
  Data: string;
  Type: string;
};

export default SaaltoZebraDataWedge;
