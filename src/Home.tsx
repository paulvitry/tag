import React from 'react';
import {useEffect} from 'react';
import {useRef} from 'react';
import {useState} from 'react';
import {
  EmitterSubscription,
  NativeEventEmitter,
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  Button,
} from 'react-native';
import SaaltoZebraDataWedge, {DataWedgeEvent, ScanDataEvent} from 'react-native-saalto-zebra-wedge';
import ModalSelector from 'react-native-modal-selector'
import FormatRfID from '../FormatRfID';

const axios = require('axios').default;


// var RNFS = require('react-native-fs');

const dataYears = [{key: 1999, label: '1999'}, {key: 2000, label: '2000'}, {key: 2001, label: '2001'},
                    {key: 2002, label: '2002'}, {key: 2003, label: '2003'}, {key: 2004, label: '2004'},
                    {key: 2005, label: '2005'}, {key: 2006, label: '2006'}, {key: 2007, label: '2007'},
                    {key: 2008, label: '2008'}, {key: 2009, label: '2009'}, {key: 2010, label: '2010'},
                    {key: 2011, label: '2011'}, {key: 2012, label: '2012'}, {key: 2013, label: '2013'},
                    {key: 2014, label: '2014'}, {key: 2015, label: '2015'}, {key: 2016, label: '2016'},
                    {key: 2017, label: '2017'}, {key: 2018, label: '2018'}, {key: 2019, label: '2019'},
                    {key: 2020, label: '2020'}, {key: 2021, label: '2021'}];

const dataCategories = [{key: 0, label: 'A'}, {key: 1, label: 'B'}, {key: 2, label: 'C'}, {key: 3, label: 'D'} ];

const dataManufacturer = [{key: 0, label: 'Barbarie'}, {key: 1, label: 'Ansquin-Sockheel'}]


const Home = () => {
  const [scannedRfID, setScannedRfID] = useState<string | null>(null);
  const [scanError, setScanError] = useState<boolean>(false);

  const [year, setYear] = useState<string>('2021');
  const [category, setCategory] = useState<string>('A');
  const [manufacturer, setManufacturer] = useState<string>('Barbarie');
  const [numbers, setNumbers] = useState<string>('');

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

  const validate = () => {
    sendForm()
    if (numbers === null || numbers.length === 5 || numbers.length === 0 ) {
      setYear("2021");
      setCategory("A");
      setManufacturer("Barbarie");
      setNumbers(null);
      setScannedRfID(null)
    } 
  }

  useEffect(() => {
    // init barcode reader when app start
    initBarCode();

    // dispose barcode on exit
    return () => disposeBarCode();
  });

  const sendForm = () => {
    let form = {  "year": year,
                  "category": category,
                  "manufacturer": manufacturer,
                  "numbers": numbers,
                  "creationDate": Date.now()
                };
    console.log(form)
    axios.put('https://qr-code-scanner-form-default-rtdb.europe-west1.firebasedatabase.app/forms/' + Date.now() + '.json', form)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log('error')
      console.log(error);
    });
  }

  let text = '';

  if (scannedRfID) {
    text = scannedRfID;
    return (
      <SafeAreaView style={{backgroundColor: "black", flex: 1, alignItems:'center'}}>
        <Text style={{color:"#00FF00", fontSize: 20, fontWeight:'bold', marginVertical: 10}}>Tag scanné : {text}</Text>

        <Text style={{color:"white"}}>Select year :</Text>
        <ModalSelector
                    data={dataYears}
                    initValue={year}
                    supportedOrientations={['landscape']}
                    accessible={true}
                    scrollViewAccessibilityLabel={'Scrollable options'}
                    cancelButtonAccessibilityLabel={'Cancel Button'}
                    onChange={(option)=>{ setYear(option.label) ; console.log(option)}}
                    style={{flex: 1, width:'80%'}}
                    />

        <Text style={{color:"white"}}>Select category :</Text>
        <ModalSelector
                    data={dataCategories}
                    initValue={category}
                    supportedOrientations={['landscape']}
                    accessible={true}
                    scrollViewAccessibilityLabel={'Scrollable options'}
                    cancelButtonAccessibilityLabel={'Cancel Button'}
                    onChange={(option)=>{ setCategory(option.label) ; console.log(option)}}
                    style={{flex: 1, width:'80%'}}
                    />
        <Text style={{color:"white"}}>Selectionnez Fabricant :</Text>
        <ModalSelector
                    data={dataManufacturer}
                    initValue={manufacturer}
                    supportedOrientations={['landscape']}
                    accessible={true}
                    scrollViewAccessibilityLabel={'Scrollable options'}
                    cancelButtonAccessibilityLabel={'Cancel Button'}
                    onChange={(option)=>{ setManufacturer(option.label) ; console.log(option)}}
                    style={{flex: 1, width:'80%', borderColor:'yellow'}}
                    />

        <Text style={{color:"white"}}>Saisir numéro à 5 chiffres</Text>
        <TextInput keyboardType='numeric' value={numbers} onChangeText={setNumbers} style={{height: 40, width: '80%', backgroundColor: "white", borderRadius: 5}}/>

        <View style={{flex: 1, justifyContent: 'center'}}>
          <Button title="Validez" onPress={validate} />
        </View>

        {/* <Button style={{flex: 1}} title="test" onPress={test} /> */}
      
      </SafeAreaView>
    )
  } else if (scanError) text = 'Tag invalide';
  else text = 'aucun tag scanné';

  return (
    <SafeAreaView style={{backgroundColor: "black", flex: 1, alignItems:'center'}}>
      <Text style={{color:"#FFFFFF", fontSize: 20, fontWeight:'bold', marginTop: 10}}>Tag scanné : {text}</Text>
      {/* <Image
        style={{width: '70%', height: '40%'}}
        source={require('@/assets/sigal.png')}
      />
      */}
    </SafeAreaView>
  );
};

export default Home;
