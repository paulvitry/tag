import React from 'react';
import {useEffect} from 'react';
import {useRef} from 'react';
import {useState} from 'react';
import {
  EmitterSubscription,
  NativeEventEmitter,
  SafeAreaView,
  Text,
} from 'react-native';
import SaaltoZebraDataWedge, {DataWedgeEvent, ScanDataEvent} from 'react-native-saalto-zebra-wedge';
import FormatRfID from './../FormatRfID';

const App = () => {
  const [scannedRfID, setScannedRfID] = useState<string | null>(null);
  const [scanError, setScanError] = useState<boolean>(false);

  const barCodeEventEmitterRef = useRef<NativeEventEmitter | null>(null);
  const scannedDataListener = useRef<EmitterSubscription | null>(null);

  const initBarCode = async () => {
    // initialize event emitter from module
    barCodeEventEmitterRef.current = new NativeEventEmitter(
      SaaltoZebraDataWedge,
    );

    // initialize zebra scanner
    await SaaltoZebraDataWedge.setupScanner(
      // Profile name ("can be any string")
      'SaaltoScannerExample',
      // Package name of the apk
      'com.example',
      // targeted android activity name. '*' for all
      '*',
      true,
    );

    // add read listener
    scannedDataListener.current = barCodeEventEmitterRef.current.addListener(
      DataWedgeEvent.ScanData,
      processTag,
    );
  };

  const disposeBarCode = () => {
    if (scannedDataListener.current) {
      scannedDataListener.current.remove();
      scannedDataListener.current = null;
    }
    if (barCodeEventEmitterRef.current)
      barCodeEventEmitterRef.current.removeAllListeners(
        DataWedgeEvent.ScanData,
      );
  };

  const processTag = async (event: ScanDataEvent) => {
    try {
      setScannedRfID(FormatRfID(event.Data));
      setScanError(false);
    } catch (e) {
      console.log;
      setScannedRfID(null);
      setScanError(true);
    }
  };

  useEffect(() => {
    // init barcode reader when app start
    initBarCode();

    // dispose barcode on exit
    return () => disposeBarCode();
  });

  let text = '';
  if (scannedRfID) text = scannedRfID;
  else if (scanError) text = 'Tag invalide';
  else text = 'aucun tag scanné';

  return (
    <SafeAreaView style={{backgroundColor: "white", flex: 1}}>
      <Text>Tag scanné : {text}</Text>
    </SafeAreaView>
  );
};

export default App;
