import { useState } from 'react'
import { Check, RefreshCw, UserPlus, Users, X } from 'lucide-react'
import PatientWebcam from './PatientWebcam'
import { getPatients } from '../data/storage'
import { registerFace } from '../utils/faceRecognition'
import { usePatient } from '../context/PatientContext'

export default function PatientScanPanel({ onRegisterNew, onClose }) {
  const { recognizePatient, clearCurrentPatient, setPendingFaceDescriptor } = usePatient()
  const [match, setMatch] = useState(null)
  const [descriptor, setDescriptor] = useState(null)
  const [existingPatients, setExistingPatients] = useState(null)
  const [error, setError] = useState('')

  function handleRecognize(result) {
    if (!result.success) return
    recognizePatient(result.patient)
    setMatch(result)
    setError('')
  }

  function handleNoMatch(result) {
    clearCurrentPatient()
    setDescriptor(result.descriptor)
    setMatch(null)
    setExistingPatients(null)
    setError('')
  }

  function scanAgain() {
    clearCurrentPatient()
    setMatch(null)
    setDescriptor(null)
    setExistingPatients(null)
    setError('')
  }

  function registerNew() {
    setPendingFaceDescriptor(descriptor)
    onRegisterNew?.()
  }

  function registerExisting(patient) {
    try {
      registerFace(patient.id, descriptor)
      recognizePatient(patient)
      setMatch({ patient, distance: null, recognitionStatus: 'MATCHED' })
      setExistingPatients(null)
      setError('')
    } catch (registrationError) {
      setError(registrationError.message || 'Face registration failed.')
    }
  }

  return <section className="patient-scan-panel">
    <div className="patient-scan-panel-heading"><div><span className="eyebrow">PATIENT IDENTIFICATION</span><h2>Scan patient</h2><p>Use the webcam to identify a registered patient before continuing.</p></div>{onClose && <button type="button" className="button button-ghost patient-scan-close" onClick={onClose} aria-label="Close patient scanner"><X size={18} /></button>}</div>
    <PatientWebcam onRecognize={handleRecognize} onNoMatch={handleNoMatch} onError={(scanError) => setError(scanError.message || 'Camera or recognition error.')} onCancel={onClose} onReset={scanAgain} />
    {match && <div className="patient-recognized"><span className="status-tag">Patient recognized</span><h3>{match.patient.name}</h3><p>{match.patient.id} · {match.patient.age} years · {match.patient.gender} · {match.patient.phone}</p>{match.distance !== null && <small>Match distance: {match.distance.toFixed(3)}</small>}<div className="form-actions"><button type="button" className="button button-primary" onClick={onClose}><Check size={17} /> Continue with patient</button><button type="button" className="button button-secondary" onClick={scanAgain}><RefreshCw size={17} /> Scan another patient</button></div></div>}
    {descriptor && !match && <div className="patient-unregistered"><span className="status-tag new">Unregistered face</span><h3>No registered face found</h3><p>Choose how to continue with this patient.</p><div className="form-actions"><button type="button" className="button button-primary" onClick={registerNew}><UserPlus size={17} /> Register new patient</button><button type="button" className="button button-secondary" onClick={() => setExistingPatients(getPatients())}><Users size={17} /> Register face to existing patient</button><button type="button" className="button button-ghost" onClick={scanAgain}><RefreshCw size={17} /> Scan another patient</button></div>{existingPatients && <div className="existing-patient-picker"><strong>Select an existing patient</strong>{existingPatients.map((patient) => <button type="button" key={patient.id} onClick={() => registerExisting(patient)}>{patient.name}<small>{patient.id} · {patient.phone}</small></button>)}</div>}</div>}
    {error && <div className="feedback error">{error}</div>}
  </section>
}
