import {
  BarChart3,
  FileText,
  PlusCircle,
  UserCheck,
  Users,
} from 'lucide-react'

const navigationItems = [
  { id: 'create-session', label: 'Create Session', icon: PlusCircle },
  { id: 'database', label: 'Database', icon: Users },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'users', label: 'Users', icon: UserCheck },
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
]

function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 text-white shadow-xl shadow-slate-950/20 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start justify-between gap-4 xl:block">
          <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            HealthNext Diagnostic Hub
          </p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">HealthNext Diagnostic Hub</h1>
          <p className="mt-1 max-w-lg text-sm text-slate-300">
            High-contrast diagnostic workflow for rural health teams.
          </p>
        </div>
        </div>

        <div className="flex flex-col gap-3 xl:items-end">
          <span className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
            Device: TC001 diagnostic unit (Connected)
          </span>

          <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1 pr-1 scrollbar-none" aria-label="Primary">
            {navigationItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                    isActive
                      ? 'border-emerald-300 bg-emerald-400 text-slate-950'
                      : 'border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500 hover:bg-slate-800'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar