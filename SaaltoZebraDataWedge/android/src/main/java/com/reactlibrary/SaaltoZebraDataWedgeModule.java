// SaaltoZebraDataWedgeModule.java

package com.reactlibrary;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;


public class SaaltoZebraDataWedgeModule extends ReactContextBaseJavaModule {
    // General constants
    public static final String ACTION = "com.symbol.datawedge.api.ACTION";
    public static final String RESULT_ACTION = "com.symbol.datawedge.api.RESULT_ACTION";
    public static final String RESULT_COMMAND = "COMMAND";

    // register for scanned barecode/qr
    public static final String COMMAND_REGISTER_NOTIFICATION = "com.symbol.datawedge.api.REGISTER_FOR_NOTIFICATION";
    public static final String COMMAND_REGISTER_NOTIFICATION_APPLICATION_NAME = "com.symbol.datawedge.api.APPLICATION_NAME";
    public static final String COMMAND_REGISTER_NOTIFICATION_NOTIFICATION_TYPE = "com.symbol.datawedge.api.NOTIFICATION_TYPE";
    public static final String COMMAND_REGISTER_NOTIFICATION_NOTIFICATION_TYPE_SCANNER_STATUS = "SCANNER_STATUS";

    // redister device status notifiation
    public static final String NOTIFICATION = "com.symbol.datawedge.api.NOTIFICATION";
    public static final String NOTIFICATION_ACTION = "com.symbol.datawedge.api.NOTIFICATION_ACTION";
    public static final String NOTIFICATION_TYPE = "NOTIFICATION_TYPE";
    public static final String NOTIFICATION_TYPE_SCANNER_STATUS = "SCANNER_STATUS";
    public static final String NOTIFICATION_TYPE_SCANNER_STATUS_STATUS = "STATUS";
    public static final String NOTIFICATION_TYPE_SCANNER_STATUS_PROFILE_NAME = "PROFILE_NAME";

    // Get version command result
    public static final String RESULT_VERSION_INFO = "com.symbol.datawedge.api.GET_VERSION_INFO";
    public static final String RESULT_VERSION_INFO_RESULT = "com.symbol.datawedge.api.RESULT_GET_VERSION_INFO";
    public static final String RESULT_VERSION_INFO_RESULT_DWVERSION = "DATAWEDGE";
    public static final String RESULT_VERSION_INFO_RESULT_BARCODE_SCANNING = "BARCODE_SCANNING";
    public static final String RESULT_VERSION_INFO_RESULT_DECODER_LIBRARY = "DECODER_LIBRARY";
    public static final String RESULT_VERSION_INFO_RESULT_SCANNER_FIRMWARE = "SCANNER_FIRMWARE";

    // Enable DataWedge
    public static final String COMMAND_ENABLE_DATAWEDGE = "com.symbol.datawedge.api.ENABLE_DATAWEDGE";

    // Trigger software scan
    public static final String COMMAND_TRIGGER_SOFT_SCAN = "com.symbol.datawedge.api.SOFT_SCAN_TRIGGER";
    public static final String COMMAND_TRIGGER_SOFT_SCAN_START = "START_SCANNING";
    public static final String COMMAND_TRIGGER_SOFT_SCAN_STOP = "STOP_SCANNING";

    // Get scanner status
    public static final String COMMAND_GET_SCANNER_STATUS = "com.symbol.datawedge.api.GET_SCANNER_STATUS";

    // Set config
    public static final String COMMAND_SET_CONFIG = "com.symbol.datawedge.api.SET_CONFIG";
    public static final String COMMAND_SEND_RESULT = "SEND_RESULT";
    public static final String COMMAND_SEND_RESULT_LAST_RESULT = "LAST_RESULT";
    // Config general props
    public static final String COMMAND_SET_CONFIG_PROFILE_NAME = "PROFILE_NAME";
    public static final String COMMAND_SET_CONFIG_PROFILE_ENABLED = "PROFILE_ENABLED";
    public static final String COMMAND_SET_CONFIG_CONFIG_MODE = "CONFIG_MODE";
    public static final String COMMAND_SET_CONFIG_CONFIG_MODE_CREATE_IF_NOT_EXIST = "CREATE_IF_NOT_EXIST";
    public static final String COMMAND_SET_CONFIG_PLUGIN_NAME = "PLUGIN_NAME";
    public static final String COMMAND_SET_CONFIG_RESET_CONFIG = "RESET_CONFIG";
    public static final String COMMAND_SET_CONFIG_PARAMS_LIST = "PARAM_LIST";
    public static final String COMMAND_SET_CONFIG_PLUGIN_CONFIG = "PLUGIN_CONFIG";
    // Barecode/Qr config
    public static final String COMMAND_SET_CONFIG_BARECODE = "BARCODE";
    public static final String COMMAND_SET_CONFIG_BARECODE_PARAMS_SCANNER_SELECTION = "scanner_selection";
    public static final String COMMAND_SET_CONFIG_BARECODE_PARAMS_SCANNER_SELECTION_AUTO = "auto";
    public static final String COMMAND_SET_CONFIG_BARECODE_PARAMS_SCANNER_INPUT_ENABLED = "scanner_input_enabled";
    public static final String COMMAND_SET_CONFIG_BARECODE_PARAMS_BEAM_TIMER = "beam_timer";
    public static final String COMMAND_SET_CONFIG_BARECODE_TRIGGER_MODE = "barcode_trigger_mode";
    public static final String COMMAND_SET_CONFIG_BARECODE_PARAMS_ILLUMINATION_MODE = "illumination_mode";
    public static final String COMMAND_SET_CONFIG_BARECODE_PARAMS_ILLUMINATION_MODE_TORCH = "torch";
    public static final String COMMAND_SET_CONFIG_BARECODE_PARAMS_ILLUMINATION_MODE_OFF = "off";
    // Intent ocnfig
    public static final String COMMAND_SET_CONFIG_INTENT = "INTENT";
    public static final String COMMAND_SET_CONFIG_INTENT_OUTPUT_ENABLED = "intent_output_enabled";
    public static final String COMMAND_SET_CONFIG_INTENT_ACTION = "intent_action";
    public static final String COMMAND_SET_CONFIG_INTENT_ACTION_NAME = ".BARECODE";
    public static final String COMMAND_SET_CONFIG_INTENT_DELIVERY = "intent_delivery";
    public static final String COMMAND_SET_CONFIG_INTENT_DELIVERY_BROADCAST = "2";
    // App list config
    public static final String COMMAND_SET_CONFIG_APP_LIST = "APP_LIST";
    public static final String COMMAND_SET_CONFIG_APP_LIST_PACKAGE_NAME = "PACKAGE_NAME";
    public static final String COMMAND_SET_CONFIG_APP_LIST_ACTIVITY_LIST = "ACTIVITY_LIST";
    // Set config result
    public static final String RESULT_SET_CONFIG_RESULT = "RESULT";
    public static final String RESULT_SET_CONFIG_RESULT_INFO = "RESULT_INFO";
    public static final String RESULT_SET_CONFIG_RESULT_INFO_CODE = "RESULT_CODE";

    static String TAG = "SAALTO_ZEBRA_WEDGE_MODULE";
    private final ReactApplicationContext reactContext;
    private BroadcastReceiver resultReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();

            if (intent.hasExtra(RESULT_VERSION_INFO_RESULT)) {
                // read informations (https://techdocs.zebra.com/datawedge/8-2/guide/api/getversioninfo/)
                String[] ScannerFirmware = {""};
                Bundle res = intent.getBundleExtra(RESULT_VERSION_INFO_RESULT);
                String DWVersion = res.getString(RESULT_VERSION_INFO_RESULT_DWVERSION);
                String BarcodeVersion = res.getString(RESULT_VERSION_INFO_RESULT_BARCODE_SCANNING);
                String DecoderVersion = res.getString(RESULT_VERSION_INFO_RESULT_DECODER_LIBRARY);

                if (res.containsKey(RESULT_VERSION_INFO_RESULT_SCANNER_FIRMWARE)) {
                    ScannerFirmware = res.getStringArray(RESULT_VERSION_INFO_RESULT_SCANNER_FIRMWARE);
                }

                // send data to react
                WritableMap event = Arguments.createMap();
                WritableArray firmwares = new WritableNativeArray();
                if (ScannerFirmware != null) {
                    for (String s : ScannerFirmware) {
                        firmwares.pushString(s);
                    }
                }
                event.putString("DataWedge", DWVersion);
                event.putString("Decoder", DecoderVersion);
                event.putString("Barcode", BarcodeVersion);
                event.putArray("ScannerFirmware", firmwares);

                Log.d(TAG, "FirmwareVersion " + event.toString());
                SaaltoZebraDataWedgeModule.this.sendEvent("FirmwareVersion", event);
            } else if (intent.getStringExtra(RESULT_COMMAND) != null
                    && intent.getStringExtra(RESULT_COMMAND).equalsIgnoreCase(COMMAND_SET_CONFIG)) {

                String result = intent.getStringExtra(RESULT_SET_CONFIG_RESULT);
                String code = null;

                Bundle bundle = intent.getBundleExtra(RESULT_SET_CONFIG_RESULT_INFO);
                if (bundle != null) {
                    code = bundle.getString(RESULT_SET_CONFIG_RESULT_INFO_CODE);
                }

                WritableMap event = Arguments.createMap();
                event.putString("ErrorCode", code);
                event.putString("Result", result);

                Log.d(TAG, "ProfileConfig " + event.toString());
                SaaltoZebraDataWedgeModule.this.sendEvent("ProfileConfig", event);

            }
        }
    };
    private BroadcastReceiver notificationReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (!action.equals(NOTIFICATION_ACTION) || !intent.hasExtra(NOTIFICATION)) return;

            Bundle b = intent.getBundleExtra(NOTIFICATION);
            String type = b.getString(NOTIFICATION_TYPE);
            if (type == null || !type.equalsIgnoreCase(NOTIFICATION_TYPE_SCANNER_STATUS)) return;

            WritableMap event = Arguments.createMap();
            event.putString("Status", b.getString(NOTIFICATION_TYPE_SCANNER_STATUS_STATUS));
            event.putString("ProfileName", b.getString(NOTIFICATION_TYPE_SCANNER_STATUS_PROFILE_NAME));

            Log.d(TAG, "DeviceStatus " + event.toString());
            SaaltoZebraDataWedgeModule.this.sendEvent("DeviceStatus", event);
        }
    };
    private BroadcastReceiver barecodeDataReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String decodedSource = intent.getStringExtra("com.symbol.datawedge.source");
            String decodedData = intent.getStringExtra("com.symbol.datawedge.data_string");
            String decodedLabelType = intent.getStringExtra("com.symbol.datawedge.label_type");

            WritableMap event = Arguments.createMap();
            event.putString("Source", decodedSource);
            event.putString("Data", decodedData);
            event.putString("Type", decodedLabelType);

            Log.d(TAG, "ScanData: " + event);
            SaaltoZebraDataWedgeModule.this.sendEvent("ScanData", event);
        }
    };

    public SaaltoZebraDataWedgeModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    private void sendEvent(String eventName,
                           @Nullable WritableMap params) {
        this.reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @Override
    public String getName() {
        return "SaaltoZebraDataWedge";
    }

    public void toggleDataWedge(boolean enable) {
        Intent i = new Intent();
        i.setAction(ACTION);
        i.putExtra(COMMAND_ENABLE_DATAWEDGE, enable);
        reactContext.sendBroadcast(i);

        if (enable) {
            IntentFilter filterResults = new IntentFilter();
            filterResults.addAction(RESULT_ACTION);
            filterResults.addCategory(Intent.CATEGORY_DEFAULT);
            reactContext.registerReceiver(resultReceiver, filterResults);

            IntentFilter filterNotification = new IntentFilter();
            filterNotification.addAction(NOTIFICATION_ACTION);
            reactContext.registerReceiver(notificationReceiver, filterNotification);
        } else {
            reactContext.unregisterReceiver(notificationReceiver);
            reactContext.unregisterReceiver(resultReceiver);
            reactContext.unregisterReceiver(barecodeDataReceiver);
        }
    }


    @ReactMethod
    public void disposeScanner() {
        this.toggleDataWedge(false);
    }

    @ReactMethod
    public void setupScanner(String name, String packageName, String activity, boolean torch) {
        this.toggleDataWedge(true);

        Bundle profileConfig = new Bundle();
        profileConfig.putString(COMMAND_SET_CONFIG_PROFILE_NAME, name);
        profileConfig.putString(COMMAND_SET_CONFIG_PROFILE_ENABLED, "true"); // <- it will be enabled
        profileConfig.putString(COMMAND_SET_CONFIG_CONFIG_MODE, COMMAND_SET_CONFIG_CONFIG_MODE_CREATE_IF_NOT_EXIST);       // <- or created if necessary.

        // PLUGIN_CONFIG BUNDLE PROPERTIES
        Bundle barecodeConfig = new Bundle();
        barecodeConfig.putString(COMMAND_SET_CONFIG_PLUGIN_NAME, COMMAND_SET_CONFIG_BARECODE);
        barecodeConfig.putString(COMMAND_SET_CONFIG_RESET_CONFIG, "true");
        // PARAM_LIST BUNDLE PROPERTIES
        Bundle barecodeParams = new Bundle();
        barecodeParams.putString(COMMAND_SET_CONFIG_BARECODE_PARAMS_SCANNER_SELECTION, COMMAND_SET_CONFIG_BARECODE_PARAMS_SCANNER_SELECTION_AUTO);
        barecodeParams.putString(COMMAND_SET_CONFIG_BARECODE_PARAMS_SCANNER_INPUT_ENABLED, "true");
        barecodeParams.putString(COMMAND_SET_CONFIG_BARECODE_PARAMS_BEAM_TIMER, "60000"); // continuous read
        barecodeParams.putString(COMMAND_SET_CONFIG_BARECODE_TRIGGER_MODE, "1");
        barecodeParams.putString(COMMAND_SET_CONFIG_BARECODE_PARAMS_ILLUMINATION_MODE,
                torch ? COMMAND_SET_CONFIG_BARECODE_PARAMS_ILLUMINATION_MODE_TORCH : COMMAND_SET_CONFIG_BARECODE_PARAMS_ILLUMINATION_MODE_OFF ); // enable torch

        // NEST THE BUNDLE "bParams" WITHIN THE BUNDLE "bConfig"
        barecodeConfig.putBundle(COMMAND_SET_CONFIG_PARAMS_LIST, barecodeParams);

        // Configure intent output for captured data to be sent to this app
        Bundle intentConfig = new Bundle();
        intentConfig.putString(COMMAND_SET_CONFIG_PLUGIN_NAME, COMMAND_SET_CONFIG_INTENT);
        intentConfig.putString(COMMAND_SET_CONFIG_RESET_CONFIG, "true");
        Bundle intentProps = new Bundle();
        intentProps.putString(COMMAND_SET_CONFIG_INTENT_OUTPUT_ENABLED, "true");
        intentProps.putString(COMMAND_SET_CONFIG_INTENT_ACTION, packageName + COMMAND_SET_CONFIG_INTENT_ACTION_NAME);
        intentProps.putString(COMMAND_SET_CONFIG_INTENT_DELIVERY, COMMAND_SET_CONFIG_INTENT_DELIVERY_BROADCAST); // broadcast
        intentConfig.putBundle(COMMAND_SET_CONFIG_PARAMS_LIST, intentProps);

        // Add plugins to array
        ArrayList<Bundle> plugins = new ArrayList();
        plugins.add(barecodeConfig);
        plugins.add(intentConfig);

        // THEN NEST THE "bConfig" BUNDLE WITHIN THE MAIN BUNDLE "bMain"
        profileConfig.putParcelableArrayList(COMMAND_SET_CONFIG_PLUGIN_CONFIG, plugins);

        // Set App list
        Bundle bundleApp = new Bundle();
        bundleApp.putString(COMMAND_SET_CONFIG_APP_LIST_PACKAGE_NAME, packageName);
        bundleApp.putStringArray(COMMAND_SET_CONFIG_APP_LIST_ACTIVITY_LIST, new String[]{activity});
        profileConfig.putParcelableArray(COMMAND_SET_CONFIG_APP_LIST, new Bundle[]{
                bundleApp
        });

        // Send profile creation intent
        Intent intentProfileConfig = new Intent();
        intentProfileConfig.setAction(ACTION);
        intentProfileConfig.putExtra(COMMAND_SET_CONFIG, profileConfig);
        intentProfileConfig.putExtra(COMMAND_SEND_RESULT, COMMAND_SEND_RESULT_LAST_RESULT);
        reactContext.sendBroadcast(intentProfileConfig);

        // Device notification (status) intent
        Bundle b = new Bundle();
        b.putString(COMMAND_REGISTER_NOTIFICATION_APPLICATION_NAME, packageName);
        b.putString(COMMAND_REGISTER_NOTIFICATION_NOTIFICATION_TYPE, COMMAND_REGISTER_NOTIFICATION_NOTIFICATION_TYPE_SCANNER_STATUS);
        Intent intentNotification = new Intent();
        intentNotification.setAction(ACTION);
        intentNotification.putExtra(COMMAND_REGISTER_NOTIFICATION, b);
        reactContext.sendBroadcast(intentNotification);

        IntentFilter filterIntentData = new IntentFilter();
        filterIntentData.addCategory(Intent.CATEGORY_DEFAULT);
        filterIntentData.addAction(packageName + COMMAND_SET_CONFIG_INTENT_ACTION_NAME);
        reactContext.registerReceiver(barecodeDataReceiver, filterIntentData);
    }

    @ReactMethod
    public void getVersion() {
        // Get version
        Intent i = new Intent();
        i.setAction(ACTION);
        i.putExtra(RESULT_VERSION_INFO, "");
        reactContext.sendBroadcast(i);
    }

    @ReactMethod
    public void toggleScan(boolean enable) {
        Intent i = new Intent();
        i.setAction(ACTION);
        i.putExtra(COMMAND_TRIGGER_SOFT_SCAN, enable ? COMMAND_TRIGGER_SOFT_SCAN_START : COMMAND_TRIGGER_SOFT_SCAN_STOP);
        reactContext.sendBroadcast(i);
    }
}

