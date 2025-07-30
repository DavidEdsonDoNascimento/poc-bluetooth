import React, { useEffect, useState } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, FlatList } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

const manager = new BleManager();

export default function App() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }
  };

  const startScan = async () => {
    await requestPermissions();
    setDevices([]);
    setIsScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        return;
      }

      if (device && device.name) {
        setDevices((prev) => {
          const alreadyFound = prev.find((d) => d.id === device.id);
          return alreadyFound ? prev : [...prev, device];
        });
      }
    });

    // Para o scan automaticamente após 10s
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  return (
    <View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20 }}>
      <Button title={isScanning ? "Escaneando..." : "Procurar dispositivos BLE"} onPress={startScan} disabled={isScanning} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
            <Text style={{ fontSize: 12, color: '#888' }}>{item.id}</Text>
          </View>
        )}
      />
    </View>
  );
}
