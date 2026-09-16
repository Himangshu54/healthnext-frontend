export const bleEventTarget = new EventTarget()

export function emitBleEvent(type, detail) {
  bleEventTarget.dispatchEvent(new CustomEvent(type, { detail }))
}

export function onBleEvent(type, listener) {
  bleEventTarget.addEventListener(type, listener)
}

export function offBleEvent(type, listener) {
  bleEventTarget.removeEventListener(type, listener)
}
