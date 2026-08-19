const parameterDefinitions = [
  { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', range: '12.0-16.0', evaluate: (value) => numericStatus(value, 12, 16) },
  { key: 'glucose', label: 'Glucose', unit: 'mg/dL', range: '70-140', evaluate: (value) => numericStatus(value, 70, 140) },
  { key: 'ph', label: 'pH', unit: '', range: '4.5-8.0', evaluate: (value) => numericStatus(value, 4.5, 8) },
  { key: 'protein', label: 'Protein', unit: '', range: 'Negative or Trace', evaluate: (value) => ['negative', 'trace'].includes(String(value).trim().toLowerCase()) ? 'Normal' : 'Attention' },
  { key: 'bloodPressure', label: 'Blood Pressure', unit: 'mmHg', range: '<120/80', evaluate: bloodPressureStatus },
  { key: 'spo2', label: 'SpO2 / Oxygen Level', unit: '%', range: '95-100', evaluate: (value) => numericStatus(value, 95, 100, 90) },
]

function numericStatus(value, minimum, maximum, attentionMinimum = minimum) {
  const numericValue = Number.parseFloat(value)
  if (!Number.isFinite(numericValue)) return 'Attention'
  if (numericValue < attentionMinimum || numericValue > maximum) return 'Critical'
  if (numericValue < minimum) return 'Attention'
  return 'Normal'
}

function bloodPressureStatus(value) {
  const [systolic, diastolic] = String(value).split('/').map(Number)
  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return 'Attention'
  if (systolic >= 140 || diastolic >= 90) return 'Critical'
  if (systolic >= 120 || diastolic >= 80) return 'Attention'
  return 'Normal'
}

export function createMockReport({ reportId, generatedAt, patient, session, sessionHistory = [] }) {
  const sessionIndex = sessionHistory.findIndex((item) => item.sessionId === session.sessionId)
  const previousSession = sessionHistory[sessionIndex - 1]
  const parameters = parameterDefinitions.map(({ key, label, unit, range, evaluate }) => ({
    key,
    label,
    value: session[key] ?? 'Not recorded',
    previousValue: previousSession?.[key] ?? 'Not recorded',
    unit,
    range,
    status: evaluate(session[key]),
  }))
  const attention = parameters.filter(({ status }) => status === 'Attention')
  const critical = parameters.filter(({ status }) => status === 'Critical')
  const observations = [...critical, ...attention].map(({ label, value, status }) => `${label}: ${value} (${status.toLowerCase()})`)
  const recommendations = critical.length
    ? ['Repeat the affected measurement and review it with a qualified health professional.', 'Escalate urgent findings according to local clinical protocol.']
    : attention.length
      ? ['Consider a repeat measurement for attention findings.', 'Discuss persistent changes with a qualified health professional.']
      : ['Continue routine monitoring and follow the local screening protocol.']

  return {
    reportId,
    generatedAt,
    isMock: true,
    patient: { id: patient.id, name: patient.name, age: patient.age, gender: patient.gender, phone: patient.phone },
    sessionId: session.sessionId,
    history: sessionHistory.map((item) => ({ sessionId: item.sessionId, date: item.date, hemoglobin: item.hemoglobin })),
    parameters,
    summary: critical.length ? 'Some readings require prompt attention.' : attention.length ? 'Some readings should be reviewed.' : 'Recorded readings are within the demo reference ranges.',
    observations: observations.length ? observations : ['No observations outside the demo reference ranges were detected.'],
    recommendations,
  }
}
