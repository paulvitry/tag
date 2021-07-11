import React from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import {
  EmitterSubscription,
  NativeEventEmitter,
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableHighlight,
  Button,
} from 'react-native';
import SaaltoZebraDataWedge, { DataWedgeEvent, ScanDataEvent } from 'react-native-saalto-zebra-wedge';
import FormatRfID from './../FormatRfID';
import Slider from '@react-native-community/slider';

const axios = require('axios').default;

const App = () => {
  const [scannedRfID, setScannedRfID] = useState<string | null>(null);
  const [scanError, setScanError] = useState<boolean>(false);

  const barCodeEventEmitterRef = useRef<NativeEventEmitter | null>(null);
  const scannedDataListener = useRef<EmitterSubscription | null>(null);

  const [selectedQRCode, setSelectedQRCode] = useState<string | null>(null)
  const [scannedQRCode, setScannedQRCode] = useState<string>(null);
  const [error, setError] = useState<boolean>(false)
  const [year, setYear] = useState<number | null>(2021);
  const [category, setCategory] = useState<string | null>('A');
  const [manufacturer, setManufacturer] = useState<string | null>('Barbarie');
  const [numbers, setNumbers] = useState<string | null>(null);
  const [scanView, setScanView] = useState<boolean>(false);


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

  const sendForm = () => {
    if (!scannedQRCode) return;
    if (numbers !== null && numbers.length !== 5 && numbers.length !== 0) return;
    let form = {
      "year": year,
      "category": category,
      "manufacturer": manufacturer,
      "numbers": numbers,
      "creationDate": Date.now(),
      "tag": scannedQRCode.toUpperCase()
    };
    console.log(form)
    axios.put('https://qr-code-scanner-form-default-rtdb.europe-west1.firebasedatabase.app/forms/' + Date.now() + '.json', form)
      .then(function (response) {
        console.log(response);
        setCategory("A");
        setManufacturer("Barbarie");
        setNumbers(null);
        setScannedQRCode(null);
        setScannedRfID(null);
        setError(false);
      })
      .catch(function (error) {
        console.log('error')
        console.log(error);
        setError(true);
      });
  }

  const setA = () => { setCategory("A") }
  const setB = () => { setCategory("B") }
  const setC = () => { setCategory("C") }
  const setD = () => { setCategory("D") }

  const setBarbarie = () => { setManufacturer("Barbarie") }
  const setAnsquinSockheel = () => { setManufacturer("Ansquin-Sockheel") }

  const onSuccess = e => {
    console.log(e);
    setScannedQRCode(e.data);
  };

  const renderCategory = () => {
    return (
      <View style={{ flex: 1, width: '100%' }}>
        <Text style={{ color: "white" }}>Séléctionnez categorie : <Text style={{ fontSize: 18 }}>{category}</Text></Text>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <TouchableHighlight style={{ heigth: 40, width: 40, border: 1, backgroundColor: 'yellow', borderRadius: 10, alignItems: 'center', justifyContent: 'center', margin: 10 }}
            onPress={setA}>
            <Text>A</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{ heigth: 40, width: 40, border: 1, backgroundColor: 'yellow', borderRadius: 10, alignItems: 'center', justifyContent: 'center', margin: 10 }}
            onPress={setB}>
            <Text>B</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{ heigth: 40, width: 40, border: 1, backgroundColor: 'yellow', borderRadius: 10, alignItems: 'center', justifyContent: 'center', margin: 10 }}
            onPress={setC}>
            <Text>C</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{ heigth: 40, width: 40, border: 1, backgroundColor: 'yellow', borderRadius: 10, alignItems: 'center', justifyContent: 'center', margin: 10 }}
            onPress={setD}>
            <Text>D</Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }

  const renderManufacturer = () => {
    return (
      <View style={{ flex: 1, width: '100%' }}>
        <Text style={{ color: "white" }}>Séléctionnez fabricant : <Text style={{ fontSize: 15 }}>{manufacturer}</Text></Text>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <TouchableHighlight style={{ flex: 1, heigth: 40, border: 1, backgroundColor: 'yellow', borderRadius: 10, alignItems: 'center', justifyContent: 'center', margin: 10 }}
            onPress={setBarbarie}>
            <Text>Barbarie</Text>
          </TouchableHighlight>
          <TouchableHighlight style={{ flex: 1, heigth: 40, border: 1, backgroundColor: 'yellow', borderRadius: 10, alignItems: 'center', justifyContent: 'center', margin: 10 }}
            onPress={setAnsquinSockheel}>
            <Text>Ansquin-Sockheel</Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }

  const renderYears = () => {
    return (
      <View style={{ flex: 1, width: '100%' }}>
        <Text style={{ color: "white" }}>Séléctionnez année : <Text style={{ fontSize: 18 }}>{year}</Text></Text>
        <Slider
          style={{ marginTop: 20 }}
          onValueChange={setYear}
          step={1}
          value={year}
          minimumValue={1999}
          maximumValue={2021}
          minimumTrackTintColor="#yellow"
          maximumTrackTintColor="yellow"
        />
      </View>
    )
  }

  let text = '';
  if (scannedRfID) setSelectedQRCode(scannedRfID);
  else if (scannedQRCode) setSelectedQRCode(scannedQRCode)
  else if (scanError) text = 'Tag invalide';
  else text = 'aucun tag scanné';

  return (
    <SafeAreaView style={{ backgroundColor: "black", flex: 1, alignItems: 'center' }}>
      {scanView ?
        <View>
            <Button title="Retournez au formulaire" onPress={() => {setScanView(false)}}/>

        </View>
        :

        <View style={{ flex: 1, alignItems: 'center', width: '90%', heigth: '100%' }}>
          <Text style={{ color: "white", fontSize: 20, fontWeight: 'bold', marginVertical: 10, flex: 1 }}>Tag scanné : {text}</Text>

          {renderYears()}
          {renderCategory()}
          {renderManufacturer()}

          <View style={{ flex: 1, width: '100%' }}>
            <Text style={{ color: "white" }}>Saisir numéro à 5 chiffres : {numbers}</Text>
            <TextInput keyboardType='numeric' value={numbers} onChangeText={setNumbers} style={{ height: 40, width: '100%', backgroundColor: "white", borderRadius: 5 }} />
          </View>

          <View style={{ flex: 1, justifyContent: 'center' }}>
            {selectedQRCode ?
              <Button title={"   Envoyer   "} onPress={sendForm} />
              :
              <Button title={"Scanner QRCode"} onPress={() => { setScanView(true) }} />
            }
          </View>
        </View>

      }

    </SafeAreaView>

  );
};

export default App;
