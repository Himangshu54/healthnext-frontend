export const DEVICE_PROTOCOL = {
  serviceUuid: null,
  characteristicUuid: null,
  note: 'Replace these placeholders with the finalized ESP BLE service and characteristic UUIDs before reading device data.',
}

export function isBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

export async function connectHealthNextDevice() {
  if (!isBluetoothSupported()) throw new Error('Bluetooth device linking is not supported in this browser. Please use a compatible browser/device.')
  const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true })
  if (!device.gatt) throw new Error('The selected Bluetooth device does not provide a GATT server.')
  const server = await device.gatt.connect()
  return { device, server, dataReady: Boolean(DEVICE_PROTOCOL.serviceUuid && DEVICE_PROTOCOL.characteristicUuid) }
}
