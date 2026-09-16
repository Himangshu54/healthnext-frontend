import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, ScanFace } from 'lucide-react'
import { usePatient } from '../context/PatientContext'

import { detectFaceDescriptor, detectFaces, findMatchingPatient, loadFaceModels } from '../utils/faceRecognition'
import './PatientWebcam.css'

export default function PatientWebcam({ onRecognize, onNoMatch, onScanComplete, onCancel }) {
  const { setCurrentPatient } = usePatient()
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const detectingRef = useRef(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [modelsReady, setModelsReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [faceCount, setFaceCount] = useState(0)
  const [detectionState, setDetectionState] = useState('Camera is stopped')

  useEffect(() => () => stopCamera(), [])

  useEffect(() => {
    if (status !== 'started' || !modelsReady) return undefined
    let cancelled = false
    async function detectLoop() {
      if (cancelled || !videoRef.current || detectingRef.current) return
      detectingRef.current = true
      try {
        const detections = await detectFaces(videoRef.current)
        if (cancelled) return
        setFaceCount(detections.length)
        setDetectionState(detections.length > 1 ? 'Multiple faces detected. Please keep only one person in front of the camera.' : detections.length === 1 ? 'Face detected' : 'No face detected')
        const canvas = overlayRef.current
        const video = videoRef.current
        const context = canvas?.getContext('2d')
        if (canvas && context && video.videoWidth) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.clearRect(0, 0, canvas.width, canvas.height)
          context.strokeStyle = detections.length === 1 ? '#53d5bd' : '#e5a93a'
          context.lineWidth = 3
          detections.forEach(({ box }) => context.strokeRect(box.x, box.y, box.width, box.height))
        }
      } catch {
        if (!cancelled) setDetectionState('Face detection unavailable')
      } finally {
        detectingRef.current = false
        if (!cancelled) timerRef.current = window.setTimeout(detectLoop, 180)
      }
    }
    detectLoop()
    return () => { cancelled = true; window.clearTimeout(timerRef.current) }
  }, [modelsReady, status])

  async function startCamera() {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) return setError('This browser does not support camera access.')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      setStatus('started')
      setBusy(true)
      setDetectionState('Loading AI face model...')
      await loadFaceModels()
      setModelsReady(true)
    } catch (cameraError) {
      setStatus('error')
      if (cameraError.name === 'NotAllowedError' || cameraError.name === 'PermissionDeniedError') setError('Camera permission was denied. Allow camera access and try again.')
      else if (cameraError.name === 'NotFoundError' || cameraError.name === 'DevicesNotFoundError') setError('No camera was found on this device.')
      else if (cameraError.name === 'NotReadableError' || cameraError.name === 'TrackStartError') setError('The camera is already in use or cannot be accessed.')
      else setError(cameraError.message || 'The camera or face models could not be started.')
    } finally {
      setBusy(false)
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    window.clearTimeout(timerRef.current)
    setStatus('idle')
    setModelsReady(false)
    setFaceCount(0)
    setDetectionState('Camera is stopped')
  }

  async function scanPatient() {
    if (!videoRef.current || status !== 'started' || !modelsReady) return setError('Start the camera and wait for face models to load.')
    setBusy(true)
    setError('')
    try {
      const detection = await detectFaceDescriptor(videoRef.current)
      if (detection.status === 'no-face') return setError('No face detected. Center one face in the camera.')
      if (detection.status === 'multiple-faces') return setError('Multiple faces detected. Only one person may be scanned.')
      const match = findMatchingPatient(detection.descriptor)
      const recognitionResult = match ? { success: true, patient: match.patient, distance: match.distance } : { success: false, error: 'No matching registered patient was found.' }
      const nextResult = recognitionResult.success ? { ...recognitionResult, state: 'registered' } : { ...recognitionResult, state: 'unregistered', descriptor: Array.from(detection.descriptor) }
      stopCamera()
      setDetectionState('Scan complete')
      if (recognitionResult.success) setCurrentPatient(recognitionResult.patient)
      onRecognize?.(nextResult)
      if (!recognitionResult.success) onNoMatch?.(nextResult)
      onScanComplete?.(nextResult)
    } catch (recognitionError) {
      setError(recognitionError.message || 'Face recognition failed. Try again with better lighting.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="patient-webcam webcam-card" aria-labelledby="webcam-title">
    <div className="section-title"><div><h2 id="webcam-title">Patient recognition</h2><p>AI face detection runs while the camera is active. Scan only after one face is detected.</p></div><ScanFace size={21} className="muted-icon" /></div>
    <div className="webcam-layout">
      <div className="camera-panel"><span className="webcam-label">Camera feed</span><video ref={videoRef} autoPlay muted playsInline aria-label="Patient webcam preview" /><canvas ref={overlayRef} className="face-overlay" aria-hidden="true" />{status === 'idle' && <div className="camera-placeholder"><Camera size={27} /><span>Camera is stopped</span></div>}{status === 'error' && <div className="camera-placeholder error-placeholder"><CameraOff size={27} /><span>Camera unavailable</span></div>}<span className="detection-status">AI status: {detectionState}</span></div>
      <div className="recognition-panel"><div className="webcam-actions"><button className="button button-primary" onClick={startCamera} disabled={status === 'started' || busy}><Camera size={17} />Start Camera</button><button className="button button-secondary" onClick={stopCamera} disabled={status !== 'started' || busy}><CameraOff size={17} />Stop Camera</button><button className="button button-primary" onClick={scanPatient} disabled={status !== 'started' || !modelsReady || busy || faceCount !== 1}><ScanFace size={17} />Scan Patient</button></div>{error && <div className="feedback error">{error}</div>}</div>
    </div>
    {onCancel && <button className="button button-ghost" type="button" onClick={onCancel}>Close scanner</button>}
  </section>
}
