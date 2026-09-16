export const BLE_UUIDS = {
  SERVICE: '19b10000-e8f2-537e-4f6c-d104768a1214',
  NOTIFY_CHAR: '19b10001-e8f2-537e-4f6c-d104768a1214',
  WRITE_CHAR: '19b10002-e8f2-537e-4f6c-d104768a1214',
}

export const VALID_INCOMING_TYPES = [
  'DEVICE_READY',
  'TEST_STARTED',
  'PROGRESS',
  'MEASUREMENT',
  'TEST_COMPLETE',
  'ERROR',
  'DEVICE_STATUS'
]

export const VALID_OUTGOING_TYPES = [
  'START_TEST',
  'STOP_TEST',
  'PING'
]

export function encodeCommand(type, payload = {}) {
  if (!VALID_OUTGOING_TYPES.includes(type)) {
    throw new Error(`Invalid outgoing message type: ${type}`)
  }
  const msg = { type, ...payload }
  return new TextEncoder().encode(JSON.stringify(msg) + '\n')
}

export function decodeMessageString(text) {
  try {
    const msg = JSON.parse(text)
    if (!VALID_INCOMING_TYPES.includes(msg.type)) {
      console.warn(`Unknown incoming message type: ${msg.type}`)
    }
    return msg
  } catch (error) {
    console.error('Failed to decode BLE message', error, 'payload:', text)
    return null
  }
}
