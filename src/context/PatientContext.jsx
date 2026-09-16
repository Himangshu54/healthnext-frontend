/* eslint-disable react-refresh/only-export-components */
import { createContext, startTransition, useContext, useEffect, useState } from 'react'
import { findPatient } from '../data/storage'
import { registerFace } from '../utils/faceRecognition'

const CURRENT_PATIENT_KEY = 'healthnext.currentPatientId'
const PENDING_FACE_KEY = 'healthnext.pendingFaceDescriptor'
const PatientContext = createContext(null)

function readCurrentPatient() {
  try {
    const patientId = localStorage.getItem(CURRENT_PATIENT_KEY)
    return patientId ? findPatient(patientId) || null : null
  } catch {
    return null
  }
}

function readPendingFaceDescriptor() {
  try {
    const descriptor = JSON.parse(localStorage.getItem(PENDING_FACE_KEY))
    return Array.isArray(descriptor) && descriptor.length ? descriptor : null
  } catch {
    return null
  }
}

export function PatientProvider({ children }) {
  const [currentPatient, setCurrentPatientState] = useState(readCurrentPatient)
  const [pendingFaceDescriptor, setPendingFaceDescriptorState] = useState(readPendingFaceDescriptor)
  const [currentTest, setCurrentTest] = useState(null)

  useEffect(() => {
    if (currentPatient?.id) localStorage.setItem(CURRENT_PATIENT_KEY, currentPatient.id)
    else localStorage.removeItem(CURRENT_PATIENT_KEY)
  }, [currentPatient])

  function setCurrentPatient(patient) {
    if (patient?.id && pendingFaceDescriptor?.length) {
      registerFace(patient.id, pendingFaceDescriptor)
      setPendingFaceDescriptorState(null)
    }
    setCurrentPatientState(patient || null)
  }

  function clearCurrentPatient() {
    setCurrentPatientState(null)
  }

  function clearCurrentTest() {
    setCurrentTest(null)
  }

  function recognizePatient(patient) {
    setCurrentPatient(patient)
  }

  function setPendingFaceDescriptor(descriptor) {
    setPendingFaceDescriptorState(descriptor ? Array.from(descriptor) : null)
  }

  function clearPendingFaceDescriptor() {
    startTransition(() => setPendingFaceDescriptorState(null))
  }

  useEffect(() => {
    if (pendingFaceDescriptor?.length) localStorage.setItem(PENDING_FACE_KEY, JSON.stringify(pendingFaceDescriptor))
    else localStorage.removeItem(PENDING_FACE_KEY)
  }, [pendingFaceDescriptor])

  function refreshCurrentPatient() {
    if (!currentPatient?.id) return null
    const refreshed = findPatient(currentPatient.id)
    setCurrentPatientState(refreshed || null)
    return refreshed || null
  }

  return <PatientContext.Provider value={{ currentPatient, setCurrentPatient, clearCurrentPatient, recognizePatient, refreshCurrentPatient, pendingFaceDescriptor, setPendingFaceDescriptor, clearPendingFaceDescriptor, currentTest, setCurrentTest, clearCurrentTest }}>{children}</PatientContext.Provider>
}

export function usePatient() {
  return useContext(PatientContext)
}
