import { useState } from 'react'
import Navbar from './components/Navbar'
import './App.css'

const tabItems = [
  { id: 'create-session', label: 'Create Session' },
  { id: 'patients-data', label: 'Patients Data' },
  { id: 'generate-report', label: 'Generate Report' },
  { id: 'report-analysis', label: 'Report Analysis' },
  { id: 'user-management', label: 'User Management' },
]

function App() {
  const [activeTab, setActiveTab] = useState('create-session')
  const [deviceName, setDeviceName] = useState('No device connected')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const handleConnectDevice = async () => {
    if (!navigator.bluetooth) {
      window.alert('Web Bluetooth is not supported in this browser.')
      return
    }

    try {
      setIsConnecting(true)
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [],
      })

      if (device.gatt) {
        await device.gatt.connect()
      }

      setDeviceName(device.name || 'Bluetooth device')
      setIsConnected(true)

      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false)
        setDeviceName('No device connected')
      })
    } catch (error) {
      if (error?.name !== 'NotFoundError') {
        window.alert('Could not connect to the Bluetooth device.')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_35%),linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,250,252,1)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        <div className="absolute -top-10 left-0 flex w-[160%] flex-wrap gap-8 whitespace-nowrap -rotate-12 opacity-[0.07]">
          {Array.from({ length: 20 }).map((_, index) => (
            <span
              key={`watermark-top-${index}`}
              className="text-6xl font-black tracking-[0.35em] text-emerald-700 sm:text-7xl lg:text-8xl"
            >
              HealthNext
            </span>
          ))}
        </div>
        <div className="absolute top-1/3 -left-16 flex w-[170%] flex-wrap gap-8 whitespace-nowrap rotate-12 opacity-[0.05]">
          {Array.from({ length: 22 }).map((_, index) => (
            <span
              key={`watermark-bottom-${index}`}
              className="text-6xl font-black tracking-[0.35em] text-emerald-700 sm:text-7xl lg:text-8xl"
            >
              HealthNext
            </span>
          ))}
        </div>
      </div>
      <div className="relative z-10">
      <Navbar
        deviceName={deviceName}
        isConnected={isConnected}
        isConnecting={isConnecting}
        onConnectDevice={handleConnectDevice}
      />
      <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="space-y-4">
          {tabItems.map((item, index) => {
            const isActive = activeTab === item.id
            const toneClasses = [
              'from-emerald-50 to-emerald-100/60',
              'from-emerald-50 to-emerald-50',
              'from-emerald-100 to-emerald-50',
              'from-emerald-50 to-lime-50',
              'from-emerald-100 to-lime-50',
            ]

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-pressed={isActive}
                className={`w-full rounded-3xl border px-5 py-5 text-left text-base font-semibold bg-linear-to-r shadow-sm transition duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-white motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg active:scale-[0.99] sm:px-8 sm:py-7 sm:text-xl ${toneClasses[index % toneClasses.length]} ${
                  isActive
                      ? 'border-emerald-300 text-emerald-950 ring-1 ring-emerald-200 shadow-emerald-200/60'
                      : 'border-emerald-100 text-emerald-900 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200/70'
                }`}
              >
                <span className="mt-2 block">{item.label}</span>
              </button>
            )
          })}
        </section>
      </main>
      </div>
    </div>
  )
}

export default App
