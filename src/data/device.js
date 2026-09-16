export const DEVICE_PROTOCOL = {
  serviceUuid: '19b10000-e8f2-537e-4f6c-d104768a1214',
  notifyCharacteristicUuid: '19b10001-e8f2-537e-4f6c-d104768a1214',
  writeCharacteristicUuid: '19b10002-e8f2-537e-4f6c-d104768a1214',
}

let writeCharacteristic = null;
let notifyCharacteristic = null;
let buffer = '';
let latestReadings = {};
let currentDevice = null;
let currentServer = null;
const decoder = new TextDecoder('utf-8');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function isBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

function clearHandles() {
  if (notifyCharacteristic) {
    notifyCharacteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
  }
  notifyCharacteristic = null;
  writeCharacteristic = null;
  currentServer = null;
  buffer = '';
}

function handleDisconnected() {
  clearHandles();
}

export async function connectHealthNextDevice(retries = 3) {
  if (!isBluetoothSupported()) throw new Error('Bluetooth device linking is not supported in this browser. Please use a compatible browser/device.')
  
  if (!currentDevice) {
    currentDevice = await navigator.bluetooth.requestDevice({ 
      filters: [{ namePrefix: 'HealthNext' }],
      optionalServices: [DEVICE_PROTOCOL.serviceUuid]
    });
    
    currentDevice.removeEventListener('gattserverdisconnected', handleDisconnected);
    currentDevice.addEventListener('gattserverdisconnected', handleDisconnected);
  }
  
  let lastError = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      clearHandles();

      if (currentDevice.gatt.connected) currentDevice.gatt.disconnect();
      await sleep(200);

      const server = await currentDevice.gatt.connect();
      await sleep(300);

      if (!server.connected) throw new Error('Link dropped before discovery');

      const service = await server.getPrimaryService(DEVICE_PROTOCOL.serviceUuid);
      const notifyChar = await service.getCharacteristic(DEVICE_PROTOCOL.notifyCharacteristicUuid);
      const writeChar = await service.getCharacteristic(DEVICE_PROTOCOL.writeCharacteristicUuid);

      notifyChar.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      notifyChar.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      await notifyChar.startNotifications();

      currentServer = server;
      notifyCharacteristic = notifyChar;
      writeCharacteristic = writeChar;
      buffer = '';

      // Firmware greets on subscription; ping as a fallback.
      await sleep(400);
      try {
        await sendCommand({ type: 'PING' });
      } catch {
        // ignore ping fail
      }

      return { device: currentDevice, server: currentServer }
    } catch (err) {
      lastError = err;
      clearHandles();
      try { currentDevice.gatt.disconnect(); } catch { /* ignore */ }
      if (attempt < retries) await sleep(600 * attempt);
    }
  }

  throw lastError || new Error('Could not connect to HealthNext device');
}

export function disconnectHealthNextDevice() {
  clearHandles();
  if (currentDevice && currentDevice.gatt && currentDevice.gatt.connected) {
    currentDevice.gatt.disconnect();
  }
  currentDevice = null;
}

export async function sendCommand(commandObj) {
  if (!writeCharacteristic) throw new Error('Not connected to device');
  const jsonStr = JSON.stringify(commandObj) + '\n';
  const encoder = new TextEncoder();
  const bytes = encoder.encode(jsonStr);
  
  if (writeCharacteristic.properties.writeWithoutResponse && writeCharacteristic.writeValueWithoutResponse) {
    await writeCharacteristic.writeValueWithoutResponse(bytes);
  } else if (writeCharacteristic.properties.write && writeCharacteristic.writeValueWithResponse) {
    await writeCharacteristic.writeValueWithResponse(bytes);
  } else {
    await writeCharacteristic.writeValue(bytes);
  }
}

function handleCharacteristicValueChanged(event) {
  const value = event.target.value;
  const chunk = decoder.decode(value, { stream: true });
  buffer += chunk;
  
  let newlineIndex;
  while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
    const messageStr = buffer.slice(0, newlineIndex).trim();
    buffer = buffer.slice(newlineIndex + 1);
    
    if (messageStr === '') continue;

    try {
      const message = JSON.parse(messageStr);
      handleDeviceMessage(message);
    } catch {
      // Partial or malformed frame - ignore and keep buffering
    }
  }

  // Safety valve against a runaway buffer
  if (buffer.length > 2048) buffer = '';
}

function handleDeviceMessage(message) {
  // Cache test readings for later retrieval via getLatestReadings()
  if (message.type === 'MEASUREMENT' || message.type === 'TEST_COMPLETE') {
    if (message.testType === 'VITALS') {
      if (message.heartRate !== undefined) latestReadings.heartRate = message.heartRate;
      if (message.temperature !== undefined) latestReadings.temperature = message.temperature;
    }
    if (message.testType === 'HB') {
      if (message.hbValue !== undefined) latestReadings.hbValue = message.hbValue;
      if (message.hbRaw !== undefined) latestReadings.hbRaw = message.hbRaw;
    }
  }
  const event = new CustomEvent('healthnext-device-message', { detail: message });
  window.dispatchEvent(event);
}

export function getLatestReadings() {
  return { ...latestReadings };
}
