export const DEVICE_PROTOCOL = {
  serviceUuid: '19b10000-e8f2-537e-4f6c-d104768a1214',
  notifyCharacteristicUuid: '19b10001-e8f2-537e-4f6c-d104768a1214',
  writeCharacteristicUuid: '19b10002-e8f2-537e-4f6c-d104768a1214',
}

let writeCharacteristic = null;
let notifyCharacteristic = null;
let buffer = '';
let currentDevice = null;

export function isBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

export async function connectHealthNextDevice() {
  if (!isBluetoothSupported()) throw new Error('Bluetooth device linking is not supported in this browser. Please use a compatible browser/device.')
  
  const device = await navigator.bluetooth.requestDevice({ 
    filters: [{ services: [DEVICE_PROTOCOL.serviceUuid] }]
  });
  
  if (!device.gatt) throw new Error('The selected Bluetooth device does not provide a GATT server.')
  
  const server = await device.gatt.connect()
  const service = await server.getPrimaryService(DEVICE_PROTOCOL.serviceUuid)
  
  notifyCharacteristic = await service.getCharacteristic(DEVICE_PROTOCOL.notifyCharacteristicUuid)
  writeCharacteristic = await service.getCharacteristic(DEVICE_PROTOCOL.writeCharacteristicUuid)
  
  buffer = '';
  notifyCharacteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)
  await notifyCharacteristic.startNotifications()

  currentDevice = device;
  return { device, server }
}

export function disconnectHealthNextDevice() {
  if (notifyCharacteristic) {
    notifyCharacteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged)
    notifyCharacteristic.stopNotifications().catch(() => {});
  }
  if (currentDevice && currentDevice.gatt && currentDevice.gatt.connected) {
    currentDevice.gatt.disconnect()
  }
  notifyCharacteristic = null;
  writeCharacteristic = null;
  currentDevice = null;
  buffer = '';
}

export async function sendCommand(commandObj) {
  if (!writeCharacteristic) throw new Error('Not connected to device');
  const jsonStr = JSON.stringify(commandObj) + '\n';
  const encoder = new TextEncoder();
  await writeCharacteristic.writeValue(encoder.encode(jsonStr));
}

function handleCharacteristicValueChanged(event) {
  const value = event.target.value;
  const decoder = new TextDecoder('utf-8');
  const chunk = decoder.decode(value);
  buffer += chunk;
  
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
    const messageStr = buffer.slice(0, newlineIndex);
    buffer = buffer.slice(newlineIndex + 1);
    
    if (messageStr.trim() === '') continue;

    try {
      const message = JSON.parse(messageStr.trim());
      handleDeviceMessage(message);
    } catch(e) {
      console.error("Failed to parse BLE message:", messageStr, e);
    }
  }
}

function handleDeviceMessage(message) {
  const event = new CustomEvent('healthnext-device-message', { detail: message });
  window.dispatchEvent(event);
}
