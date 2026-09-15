import { useState } from 'react'

function Navbar({ deviceName, isConnected, isConnecting, onConnectDevice }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/90 text-slate-900 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-3 sm:px-6 lg:px-8 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
        <div className="flex flex-col gap-3 md:items-start">
          <button
            type="button"
            onClick={onConnectDevice}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-linear-to-r from-emerald-50 to-white px-4 py-2.5 text-xs font-semibold text-emerald-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isConnecting}
            aria-label="Connect Bluetooth device"
          >
            <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${isConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span className="whitespace-nowrap">
              {isConnecting ? 'Searching Bluetooth devices...' : deviceName}
            </span>
          </button>
        </div>

        <div className="flex items-start justify-between gap-4 md:justify-center">
          <div className="text-left md:text-center">
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              HealthNext Diagnostic Hub
            </h1>
            <p className="mt-1 max-w-lg text-sm leading-6 text-slate-600">
              Diagonstic hub for rural screening and early risk detection
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className="inline-flex items-center gap-3 rounded-full border border-emerald-200 bg-white px-3 py-2 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-white"
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                U
              </span>
              <span className="hidden text-sm font-semibold text-slate-900 sm:block">
                Profile
              </span>
            </button>

            {isProfileOpen ? (
              <div className="absolute right-0 z-20 mt-3 w-72 rounded-3xl border border-emerald-100 bg-white p-4 shadow-xl shadow-slate-200/70">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-800">
                    U
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">User Profile</p>
                    <p className="text-xs text-slate-500">Active session account</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Name
                    </p>
                    <p className="mt-1 font-medium">HealthNext Operator</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Role
                    </p>
                    <p className="mt-1 font-medium">Field Technician</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Status
                    </p>
                    <p className="mt-1 font-medium text-emerald-700">Available</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar