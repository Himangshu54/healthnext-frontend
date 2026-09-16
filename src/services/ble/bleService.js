import { BLE_UUIDS, decodeMessageString, encodeCommand } from './bleProtocol'
import { emitBleEvent } from './bleEvents'

let device = null
let notifyCharacteristic = null
let writeCharacteristic = null
let gattServer = null

let incomingBuffer = ''
const decoder = new TextDecoder()

export async function requestDevice() {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth is not supported in this browser.')
  }

  try {
    device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [BLE_UUIDS.SERVICE] }]
    })

    device.addEventListener('gattserverdisconnected', handleDisconnect)

    return device
  } catch (error) {
    console.error('Failed to request device:', error)
    throw error
  }
}

export async function connect() {
  if (!device) {
    throw new Error('No device selected. Call requestDevice first.')
  }

  try {
    emitBleEvent('CONNECTION_STATE', { state: 'connecting' })
    
    gattServer = await device.gatt.connect()
    
    const service = await gattServer.getPrimaryService(BLE_UUIDS.SERVICE)
    
    notifyCharacteristic = await service.getCharacteristic(BLE_UUIDS.NOTIFY_CHAR)
    writeCharacteristic = await service.getCharacteristic(BLE_UUIDS.WRITE_CHAR)

    await notifyCharacteristic.startNotifications()
    notifyCharacteristic.addEventListener('characteristicvaluechanged', handleNotification)

    emitBleEvent('CONNECTION_STATE', { state: 'connected', deviceName: device.name })
    return true
  } catch (error) {
    console.error('Connection failed:', error)
    emitBleEvent('CONNECTION_STATE', { state: 'error', error: error.message })
    throw error
  }
}

export async function disconnect() {
  if (gattServer && gattServer.connected) {
    gattServer.disconnect()
  }
  // cleanup handles in handleDisconnect
}

function handleDisconnect() {
  console.log('Device disconnected')
  if (notifyCharacteristic) {
    notifyCharacteristic.removeEventListener('characteristicvaluechanged', handleNotification)
  }
  gattServer = null
  notifyCharacteristic = null
  writeCharacteristic = null
  incomingBuffer = ''
  
  emitBleEvent('CONNECTION_STATE', { state: 'disconnected' })
}

function handleNotification(event) {
  const chunk = decoder.decode(event.target.value, { stream: true })
  incomingBuffer += chunk
  
  let newlineIndex;
  while ((newlineIndex = incomingBuffer.indexOf('\n')) !== -1) {
    const messageStr = incomingBuffer.slice(0, newlineIndex).trim()
    incomingBuffer = incomingBuffer.slice(newlineIndex + 1)
    
    if (messageStr) {
      const msg = decodeMessageString(messageStr)
      if (msg) {
        emitBleEvent('MESSAGE_RECEIVED', msg)
        if (msg.type) {
          emitBleEvent(msg.type, msg)
        }
      }
    }
  }
}

export async function sendCommand(type, payload = {}) {
  if (!writeCharacteristic) {
    throw new Error('Not connected to a BLE device')
  }

  try {
    const data = encodeCommand(type, payload)
    // Use writeValueWithoutResponse if required by properties, falling back to writeValue if not supported
    if (writeCharacteristic.properties.writeWithoutResponse) {
      await writeCharacteristic.writeValueWithoutResponse(data)
    } else {
      await writeCharacteristic.writeValue(data)
    }
    emitBleEvent('MESSAGE_SENT', { type, ...payload })
  } catch (error) {
    console.error('Failed to send command:', error)
    throw error
  }
}

export function isConnected() {
  return gattServer && gattServer.connected
}

export function getDevice() {
  return device
}
