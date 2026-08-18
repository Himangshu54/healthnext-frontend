const PATIENTS_KEY = 'healthnext.patients'
const REPORTS_KEY = 'healthnext.reports'

const demoPatients = [
  ['Asha Devi', '9876501001', 29, 'Female', 11.8, 96, 6.4, 'Negative', '118/76', 98],
  ['Ramesh Yadav', '9876501002', 43, 'Male', 13.4, 104, 6.8, 'Trace', '126/82', 97],
  ['Sushila Kumari', '9876501003', 36, 'Female', 10.2, 112, 6.2, 'Negative', '122/78', 96],
  ['Mohan Prasad', '9876501004', 55, 'Male', 14.1, 99, 6.7, 'Negative', '130/84', 99],
  ['Farzana Khatoon', '9876501005', 25, 'Female', 12.1, 91, 6.5, 'Negative', '116/74', 98],
  ['Kiran Sharma', '9876501006', 31, 'Female', 12.7, 108, 6.6, 'Negative', '120/80', 97],
  ['Vijay Singh', '9876501007', 47, 'Male', 13.8, 101, 6.9, 'Negative', '128/80', 98],
  ['Meena Joshi', '9876501008', 39, 'Female', 11.5, 116, 6.3, 'Trace', '124/78', 97],
  ['Arjun Patel', '9876501009', 52, 'Male', 13.2, 109, 6.8, 'Negative', '132/86', 96],
  ['Lata Verma', '9876501010', 27, 'Female', 12.4, 94, 6.5, 'Negative', '114/72', 99],
]

function seedPatients() {
  const now = Date.now()
  return demoPatients.map(([name, phone, age, gender, hemoglobin, glucose, ph, protein, bloodPressure, spo2], index) => {
    const firstDate = new Date(now - (index + 2) * 86400000).toISOString()
    const latestDate = new Date(now - index * 3600000).toISOString()
    const base = { hemoglobin, glucose, ph, protein, bloodPressure, spo2 }
    return {
      id: `P${String(index + 1).padStart(3, '0')}`,
      name, phone, age, gender, email: '', address: '', medicalHistory: '', createdAt: firstDate,
      testHistory: [
        { sessionId: `DEMO-${String(index + 1).padStart(3, '0')}-01`, date: firstDate, ...base },
        { sessionId: `DEMO-${String(index + 1).padStart(3, '0')}-02`, date: latestDate, ...base, hemoglobin: Number((hemoglobin + 0.3).toFixed(1)), glucose: glucose + 4, spo2: Math.max(94, spo2 - 1) },
      ],
    }
  })
}

function read(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return Array.isArray(value) ? value : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getPatients() {
  const patients = read(PATIENTS_KEY)
  if (patients.length) return patients
  const seeded = seedPatients()
  write(PATIENTS_KEY, seeded)
  return seeded
}

export function findPatient(id) {
  return getPatients().find((patient) => patient.id.toLowerCase() === id.trim().toLowerCase())
}

export function findPatientByNameAndPhone(name, phone) {
  return getPatients().find(
    (patient) => patient.name.trim().toLowerCase() === name.trim().toLowerCase() && patient.phone.trim() === phone.trim(),
  )
}

export function nextPatientId() {
  const highest = getPatients().reduce((max, patient) => Math.max(max, Number(patient.id.replace(/\D/g, '')) || 0), 0)
  return `P${String(highest + 1).padStart(3, '0')}`
}

export function savePatient(patient) {
  const patients = getPatients()
  const existingIndex = patients.findIndex((item) => item.id.toLowerCase() === patient.id.toLowerCase())
  if (existingIndex >= 0) patients[existingIndex] = patient
  else patients.push(patient)
  write(PATIENTS_KEY, patients)
  return patient
}

export function getReports() {
  return read(REPORTS_KEY)
}

export function saveReport(report) {
  const reports = getReports()
  reports.push(report)
  write(REPORTS_KEY, reports)
  return report
}

export function createId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}
