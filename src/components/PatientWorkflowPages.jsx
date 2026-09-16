import { startTransition, useEffect, useState } from 'react'
import { BarChart3, Check, Download, FileText, Plus, ShieldCheck } from 'lucide-react'
import { usePatient } from '../context/PatientContext'
import { createId, saveReport } from '../data/storage'
import { createMockReport } from '../data/mockReport'
import { downloadMockReport } from '../data/reportDownload'

const parameters = [
  ['hemoglobin', 'Hemoglobin', 'g/dL'], ['glucose', 'Glucose', 'mg/dL'], ['ph', 'pH', ''],
  ['protein', 'Protein', ''], ['bloodPressure', 'Blood Pressure', 'mmHg'], ['spo2', 'SpO2', '%'],
]

function formatDate(value) { return value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not recorded' }
function PageHeader({ eyebrow, title, subtitle }) { return <div className="page-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div> }
function ActionButton({ children, variant = 'primary', ...props }) { return <button className={`button button-${variant}`} {...props}>{children}</button> }

export function PatientGenerateReport() {
  const { currentPatient } = usePatient()
  const [selected, setSelected] = useState(currentPatient?.testHistory?.at(-1)?.sessionId || '')
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { startTransition(() => { setSelected(currentPatient?.testHistory?.at(-1)?.sessionId || ''); setReport(null); setError('') }) }, [currentPatient])
  const history = currentPatient?.testHistory || []

  function generate() {
    if (!currentPatient) return setError('No patient has been recognized yet.')
    const session = history.find((item) => item.sessionId === selected)
    if (!session) return setError('Select a test session before generating a report.')
    setError('')
    setReport(saveReport(createMockReport({ reportId: createId('REPORT'), generatedAt: new Date().toISOString(), patient: currentPatient, session, sessionHistory: history })))
  }

  if (report) return <><PageHeader eyebrow="REPORTS" title="Generated health report" subtitle="A locally generated demonstration report from the recognized patient." /><div className="success-state compact"><span className="success-icon"><Check size={30} /></span><h2>Report generated successfully.</h2><p>MOCK REPORT / DEMO DATA - NOT FOR MEDICAL DIAGNOSIS</p><div className="detail-card"><div><span>Report ID</span><strong>{report.reportId}</strong></div><div><span>Patient</span><strong>{report.patient.id} · {report.patient.name}</strong></div><div><span>Generated</span><strong>{formatDate(report.generatedAt)}</strong></div><div><span>Session</span><strong>{report.sessionId}</strong></div></div><div className="analysis-card"><h2>Health parameters</h2><div className="comparison-table"><div className="comparison-head"><span>Parameter</span><span>Latest</span><span>Previous</span><span>Reference</span><span>Status</span></div>{report.parameters.map((parameter) => <div className="comparison-row" key={parameter.key}><strong>{parameter.label}<small>{parameter.unit}</small></strong><span>{parameter.value}</span><span>{parameter.previousValue}</span><span>{parameter.range}</span><span>{parameter.status}</span></div>)}</div><p><strong>Overall summary:</strong> {report.summary}</p></div><div className="form-actions"><ActionButton variant="secondary" onClick={() => downloadMockReport(report)}><Download size={17} />Download Report</ActionButton><ActionButton variant="secondary" onClick={() => setReport(null)}><FileText size={17} />Generate another report</ActionButton></div></div></>
  return <><PageHeader eyebrow="REPORTS" title="Generate report" subtitle="Create a structured report from the recognized patient session." />{currentPatient ? <div className="form-card report-flow"><div className="verified-banner"><ShieldCheck size={19} /><div><strong>Recognized patient</strong><span>{currentPatient.id} · {currentPatient.name} · {history.length} recorded sessions</span></div></div>{history.length ? <><h2>Select test session</h2><div className="session-list">{history.map((session) => <label className={`session-row ${selected === session.sessionId ? 'selected' : ''}`} key={session.sessionId}><input type="radio" name="session" checked={selected === session.sessionId} onChange={() => setSelected(session.sessionId)} /><span><strong>{formatDate(session.date)}</strong><small>{session.sessionId}</small></span><em>Recorded</em></label>)}</div><ActionButton onClick={generate}><FileText size={17} />Generate Report</ActionButton></> : <p>No recorded sessions are available for this patient.</p>}{error && <div className="feedback error">{error}</div>}</div> : <div className="empty-state"><span className="empty-icon"><FileText size={28} /></span><h2>No patient has been recognized yet.</h2><p>Recognize a patient from the dashboard webcam before generating a report.</p></div>}</>
}

export function PatientAnalysis() {
  const { currentPatient } = usePatient()
  const history = currentPatient?.testHistory || []
  const current = history.at(-1)
  const previous = history.at(-2)
  function compare(name) { const oldValue = Number.parseFloat(previous?.[name]); const newValue = Number.parseFloat(current?.[name]); const numeric = Number.isFinite(oldValue) && Number.isFinite(newValue); const difference = numeric ? newValue - oldValue : null; return { oldValue: previous?.[name] ?? '-', newValue: current?.[name] ?? '-', difference } }
  return <><PageHeader eyebrow="ANALYSIS" title="Report analysis" subtitle="Compare recorded sessions for the recognized patient." />{!currentPatient ? <div className="empty-state"><span className="empty-icon"><BarChart3 size={28} /></span><h2>No patient has been recognized yet.</h2><p>Recognize a patient from the dashboard webcam before opening analysis.</p></div> : history.length < 2 ? <div className="empty-state"><span className="empty-icon"><BarChart3 size={28} /></span><h2>More history is needed for comparison.</h2><p>{currentPatient.name} has {history.length} recorded session. Create another session to compare changes.</p><ActionButton onClick={() => { window.history.pushState({}, '', '/create-session'); window.dispatchEvent(new PopStateEvent('popstate')) }}><Plus size={17} />Create Diagnostic Session</ActionButton></div> : <><div className="verified-banner standalone"><ShieldCheck size={19} /><div><strong>Recognized patient · {currentPatient.name}</strong><span>{currentPatient.id} · {currentPatient.phone} · {currentPatient.gender} · {currentPatient.age} years</span></div></div><div className="analysis-card"><div className="section-title"><div><h2>Session comparison</h2><p>Latest session compared with the previous recorded session.</p></div></div><div className="comparison-table"><div className="comparison-head"><span>Parameter</span><span>Previous</span><span>Current</span><span>Difference</span><span>Trend</span></div>{parameters.map(([name, label, unit]) => { const item = compare(name); const direction = item.difference > 0 ? 'up' : item.difference < 0 ? 'down' : 'same'; return <div className="comparison-row" key={name}><strong>{label}<small>{unit}</small></strong><span>{item.oldValue}</span><span>{item.newValue}</span><span>{item.difference === null ? '-' : `${item.difference > 0 ? '+' : ''}${item.difference.toFixed(2)}`}</span><span className={`trend ${direction}`}>{direction === 'up' ? 'Increased' : direction === 'down' ? 'Decreased' : 'No change'}</span></div> })}</div></div></>}</>
}
