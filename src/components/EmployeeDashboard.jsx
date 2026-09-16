import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BarChart3, ClipboardList, FileText, Users } from 'lucide-react'
import { usePatient } from '../context/PatientContext'
import PatientScanPanel from './PatientScanPanel'

function navigate(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function PageHeader({ eyebrow, title, subtitle }) {
  return <div className="page-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div>
}

function EmployeeDashboard() {
  const { currentPatient, clearCurrentPatient, clearPendingFaceDescriptor } = usePatient()
  const [hasScannedFace, setHasScannedFace] = useState(false)
  const workflowOptionsRef = useRef(null)
  const cards = [
    { title: 'Create Session', description: 'Start a new diagnostic session and record patient test readings.', icon: ClipboardList, path: '/create-session' },
    { title: 'Patients Data', description: 'View patient records and their diagnostic history.', icon: Users, path: '/patients' },
    { title: 'Generate Report', description: 'Verify a patient and generate a diagnostic report.', icon: FileText, path: '/generate-report' },
    { title: 'Report Analysis', description: 'Review previous reports and analyze changes in patient history.', icon: BarChart3, path: '/report-analysis' },
  ]

  useEffect(() => {
    if (hasScannedFace) workflowOptionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hasScannedFace])

  function resetScan() {
    clearCurrentPatient()
    clearPendingFaceDescriptor()
    setHasScannedFace(false)
  }

  return <>
    <PageHeader eyebrow="EMPLOYEE WORKSPACE" title="Welcome to HealthNext" subtitle="Your field screening workspace is ready." />
    {!hasScannedFace && (
      <PatientScanPanel 
        onRegisterNew={() => setHasScannedFace(true)}
        onClose={() => setHasScannedFace(true)} 
      />
    )}
    {hasScannedFace && <section className="workflow-options" ref={workflowOptionsRef} aria-labelledby="workflow-options-title">
      <div className="workflow-heading"><div><span className="eyebrow">PATIENT WORKSPACE</span><h2 id="workflow-options-title">{currentPatient ? `${currentPatient.id} · ${currentPatient.name}` : 'Manual patient details required'}</h2><p>{currentPatient ? 'Registered patient selected.' : 'Patient details need to be entered manually.'}</p></div><button className="button button-ghost" onClick={resetScan}>Scan Another Patient</button></div>
      <div className="feature-grid">{cards.map(({ title, description, icon: Icon, path }) => <button className="feature-card" key={path} onClick={() => navigate(path)}><span className="feature-icon"><Icon size={22} /></span><span className="feature-body"><strong>{title}</strong><span>{description}</span></span><ArrowRight className="feature-arrow" size={19} /></button>)}</div>
    </section>}
  </>
}

export default EmployeeDashboard
