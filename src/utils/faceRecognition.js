import * as faceapi from '@vladmandic/face-api'
import { findPatient, getPatients } from '../data/storage'

const FACE_REGISTRATIONS_KEY = 'healthnext.faceRegistrations'
export const MATCH_THRESHOLD = 0.5
let modelsPromise

function readRegistrations() {
  try {
    const value = JSON.parse(localStorage.getItem(FACE_REGISTRATIONS_KEY))
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function writeRegistrations(registrations) {
  localStorage.setItem(FACE_REGISTRATIONS_KEY, JSON.stringify(registrations))
}

export function loadFaceModels() {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ])
  }
  return modelsPromise
}

export async function detectFaceDescriptors(videoElement) {
  return faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors()
}

export async function detectFaces(videoElement) {
  return faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
}

export async function detectFaceDescriptor(videoElement) {
  const detections = await detectFaceDescriptors(videoElement)
  if (!detections.length) return { status: 'no-face' }
  if (detections.length > 1) return { status: 'multiple-faces' }
  return { status: 'success', descriptor: detections[0].descriptor }
}

export function registerFace(patientId, descriptor) {
  if (!findPatient(patientId)) throw new Error('Patient not found.')
  const registrations = readRegistrations().filter((registration) => registration.patientId !== patientId)
  registrations.push({ patientId, descriptor: Array.from(descriptor) })
  writeRegistrations(registrations)
  return { patientId }
}

export function findMatchingPatient(descriptor) {
  const patients = getPatients()
  const matches = readRegistrations()
    .map((registration) => ({ ...registration, patient: patients.find((patient) => patient.id === registration.patientId) }))
    .filter(({ patient, descriptor: storedDescriptor }) => patient && storedDescriptor?.length)
    .map(({ patient, descriptor: storedDescriptor }) => ({ patient, distance: faceapi.euclideanDistance(descriptor, storedDescriptor) }))
    .sort((left, right) => left.distance - right.distance)
  const bestMatch = matches[0]
  return bestMatch && bestMatch.distance <= MATCH_THRESHOLD ? bestMatch : null
}

export function clearRegisteredFace(patientId) {
  writeRegistrations(readRegistrations().filter((registration) => registration.patientId !== patientId))
}

export function clearAllRegisteredFaces() {
  localStorage.removeItem(FACE_REGISTRATIONS_KEY)
}

export function getRegisteredFaceIds() {
  return readRegistrations().map(({ patientId }) => patientId)
}
