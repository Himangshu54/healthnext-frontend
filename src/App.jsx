import { useState } from 'react'
import Navbar from './components/Navbar'
import mockData from './data/mockData'
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  FileText,
  FlaskConical,
  HeartPulse,
  ShieldAlert,
  Users,
} from 'lucide-react'
import './App.css'

function getLatestSession(patient) {
  return patient.testSessions[patient.testSessions.length - 1]
}

function getPatientStatus(patient) {
  const latestSession = getLatestSession(patient)
  return latestSession?.overallStatus ?? 'Normal'
}

function getStatusTone(status) {
  if (status === 'Flagged') {
    return 'border-rose-200 bg-rose-50 text-rose-700'
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

function StatCard({ label, value, caption, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-300">{caption}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-emerald-200">
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function EmptyTabState({ eyebrow, title, description, icon: Icon, accent }) {
  return (
    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${accent}`}>
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent} bg-slate-50`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Ready for expansion</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            This panel is styled to support forms, searchable records, or report workflows in the
            next phase.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Mobile-friendly structure</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            The layout stacks cleanly on smaller screens and keeps the key actions easy to reach.
          </p>
        </div>
      </div>
    </div>
  )
}

function PatientDatabase() {
  const recentPatients = mockData.slice(0, 4)

  return (
    <EmptyTabState
      eyebrow="Patient Database"
      title="Searchable patient history, sessions, and risk flags."
      description="The dashboard already has live mock records behind it, so this view can evolve into a searchable patient registry without redesigning the shell."
      icon={Users}
      accent="text-emerald-700"
    >
      <div className="mt-6 grid gap-4">
        {recentPatients.map((patient) => {
          const status = getPatientStatus(patient)

          return (
            <div
              key={patient.patientId}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {patient.patientId}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">{patient.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {patient.age} years · {patient.sex} · {patient.village}
                </p>
              </div>
              <div className={`inline-flex w-fit rounded-full border px-3 py-1 text-sm font-semibold ${getStatusTone(status)}`}>
                {status}
              </div>
            </div>
          )
        })}
      </div>
    </EmptyTabState>
  )
}

function CreateSession() {
  const flaggedSessions = mockData.filter((patient) => getPatientStatus(patient) === 'Flagged')

  return (
    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-200/60">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Create Session
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Fast, guided triage for rural screening workflows.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Start a new patient session, capture key measurements, and keep the interface simple
            enough for low-training environments.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Start new session
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open protocol
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <StatCard label="Patients" value={mockData.length} caption="Mock records loaded" icon={Users} />
            <StatCard label="Alerts" value={flaggedSessions.length} caption="Sessions flagged for review" icon={ShieldAlert} />
            <StatCard label="Coverage" value="Live" caption="Offline-first PWA ready" icon={HeartPulse} />
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
            Suggested workflow
          </p>
          <div className="mt-4 space-y-3">
            {[
              'Select or search the patient',
              'Capture hemoglobin, urine, and SpO2',
              'Review status and escalate if needed',
            ].map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{step}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Built for minimal taps and very clear visual feedback.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            The create session screen is now styled as a practical starting point instead of a blank
            placeholder.
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportGenerator() {
  return (
    <EmptyTabState
      eyebrow="Report Generator"
      title="Clean report output for referrals and follow-up."
      description="This section is intentionally simple and high contrast so the output can later support printing, saving, or sharing without confusing the user."
      icon={FileText}
      accent="text-amber-700"
    />
  )
}

function UserManagement() {
  return (
    <EmptyTabState
      eyebrow="User Management"
      title="Role-based access for ASHAs, nurses, and doctors."
      description="A clear role model is easier to train on and safer to maintain across clinics and field workers."
      icon={ClipboardList}
      accent="text-sky-700"
    />
  )
}

function ReportAnalysis() {
  const flaggedSessions = mockData.filter((patient) => getPatientStatus(patient) === 'Flagged')

  return (
    <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-indigo-700">
            <BarChart3 size={14} />
            Analysis
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            Trends and alert patterns at a glance.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            The data model already supports a future Recharts view, so this space can become a
            real summary dashboard without changing the structure.
          </p>
        </div>
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-medium text-indigo-800">
          {flaggedSessions.length} flagged session(s) across {mockData.length} patients
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Hemoglobin checks</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Most useful for spotting moderate anemia and triggering a simple escalation path.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">Urine screening</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Structured fields make it easy to compare glucose, protein, and pH over time.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">SpO2 monitoring</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Oxygen saturation and pulse can later be charted in a compact panel for field review.
          </p>
        </div>
      </div>
    </div>
  )
}

const tabViews = {
  'create-session': CreateSession,
  database: PatientDatabase,
  report: ReportGenerator,
  users: UserManagement,
  analysis: ReportAnalysis,
}

function App() {
  const [activeTab, setActiveTab] = useState('create-session')
  const ActiveView = tabViews[activeTab] ?? CreateSession

  const flaggedCount = mockData.filter((patient) => getPatientStatus(patient) === 'Flagged').length
  const normalCount = mockData.length - flaggedCount
  const totalSessions = mockData.reduce((total, patient) => total + patient.testSessions.length, 0)
  const latestPatients = mockData.slice(0, 3)

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_34%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.12),transparent_30%),linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(226,232,240,0.72)_100%)]" />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="grid gap-5 lg:grid-cols-[1.25fr,0.75fr]">
          <div className="rounded-4xl border border-slate-900/10 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/60 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
                  HealthNext
                </p>
                <h1 className="mt-3 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  Diagnostic hub for rural screening and early risk detection.
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                  A responsive web and PWA-ready dashboard for ASHA workers and Primary Health
                  Centres, designed for low-bandwidth environments and quick triage.
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                <p className="font-semibold">Connected device</p>
                <p className="mt-1">TC001 is the field diagnostic unit used for test capture</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Patients" value={mockData.length} caption="Mock records available" icon={Users} />
              <StatCard label="Sessions" value={totalSessions} caption="Captured across visits" icon={FlaskConical} />
              <StatCard label="Flagged" value={flaggedCount} caption="Needs review" icon={ShieldAlert} />
              <StatCard label="Normal" value={normalCount} caption="Within expected range" icon={HeartPulse} />
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-slate-200">
              {['High contrast', 'Low training', 'Offline ready', 'Mobile friendly'].map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <aside className="rounded-4xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Field readiness
            </p>
            <div className="mt-4 space-y-4">
              {[
                { title: 'Device health', value: 'Connected', detail: 'TC001 reporting live data' },
                { title: 'Session flow', value: 'Guided', detail: 'Minimal taps and clear status states' },
                { title: 'Rendering', value: 'Responsive', detail: 'Stacks cleanly on tablets and phones' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">{item.value}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Active module
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                  {activeTab === 'create-session' && 'Create Session'}
                  {activeTab === 'database' && 'Patient Database'}
                  {activeTab === 'report' && 'Report Generator'}
                  {activeTab === 'users' && 'User Management'}
                  {activeTab === 'analysis' && 'Report Analysis'}
                </h2>
              </div>
              <p className="text-sm text-slate-600">
                Designed to stay readable and useful on desktop, tablet, and mobile.
              </p>
            </div>

            <ActiveView />
          </div>

          <aside className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Recent patients
                  </p>
                  <h3 className="mt-1 text-xl font-bold text-slate-950">Quick glance</h3>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {mockData.length} total
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {latestPatients.map((patient) => {
                  const status = getPatientStatus(patient)

                  return (
                    <div key={patient.patientId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                            {patient.patientId}
                          </p>
                          <h4 className="mt-1 text-base font-semibold text-slate-950">{patient.name}</h4>
                          <p className="mt-1 text-sm text-slate-600">
                            {patient.village} · {patient.age} yrs · {patient.sex}
                          </p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(status)}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-200/60">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                Why this layout works
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>Large contrast blocks keep the interface readable outdoors and on budget displays.</li>
                <li>Cards stack naturally on narrow screens without losing the core action flow.</li>
                <li>Primary actions stay visible, while detailed content remains grouped and scannable.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}

export default App
