import { useState, useEffect, useCallback } from 'react'
import { requestDevice, connect as connectDevice, disconnect as disconnectDevice, sendCommand as sendDeviceCommand, isConnected, getDevice } from './bleService'
import { onBleEvent, offBleEvent } from './bleEvents'

export function useBLE() {
  const [bleState, setBleState] = useState(isConnected() ? 'connected' : 'disconnected')
  const [device, setDevice] = useState(getDevice())
  const [lastMessage, setLastMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    function handleConnectionState(e) {
      setBleState(e.detail.state)
      if (e.detail.error) setError(e.detail.error)
      if (e.detail.state === 'disconnected') setDevice(null)
      if (e.detail.state === 'connected') setDevice(getDevice())
    }

    function handleMessageReceived(e) {
      setLastMessage(e.detail)
    }

    onBleEvent('CONNECTION_STATE', handleConnectionState)
    onBleEvent('MESSAGE_RECEIVED', handleMessageReceived)

    return () => {
      offBleEvent('CONNECTION_STATE', handleConnectionState)
      offBleEvent('MESSAGE_RECEIVED', handleMessageReceived)
    }
  }, [])

  const connect = useCallback(async () => {
    try {
      setError(null)
      if (!getDevice()) {
        await requestDevice()
      }
      await connectDevice()
    } catch (err) {
      setError(err.message || 'Failed to connect')
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      await disconnectDevice()
    } catch (err) {
      console.error('Failed to disconnect', err)
    }
  }, [])

  const sendCommand = useCallback(async (type, payload) => {
    try {
      setError(null)
      await sendDeviceCommand(type, payload)
    } catch (err) {
      setError(err.message || 'Failed to send command')
    }
  }, [])

  return {
    bleState,
    device,
    connect,
    disconnect,
    sendCommand,
    lastMessage,
    error
  }
}
