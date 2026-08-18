const mockData = [
  {
    patientId: 'TC-P001',
    name: 'Anita Devi',
    age: 28,
    sex: 'Female',
    village: 'Barauli',
    testSessions: [
      {
        timestamp: '2026-08-15T09:15:00Z',
        deviceId: 'TC001',
        operatorName: 'Sunita Kumari',
        overallStatus: 'Flagged',
        hb: { value: 9.4, unit: 'g/dL', status: 'Moderate Anemia' },
        urine: { glucose: 'Negative', protein: 'Trace', ph: 6.5, status: 'Normal' },
        spo2: { spo2: 97, pulse: 78, status: 'Normal' },
      },
    ],
  },
  {
    patientId: 'TC-P002',
    name: 'Ramesh Yadav',
    age: 41,
    sex: 'Male',
    village: 'Dharampur',
    testSessions: [
      {
        timestamp: '2026-08-15T10:40:00Z',
        deviceId: 'TC001',
        operatorName: 'Meera Devi',
        overallStatus: 'Normal',
        hb: { value: 13.1, unit: 'g/dL', status: 'Normal' },
        urine: { glucose: 'Negative', protein: 'Negative', ph: 6.8, status: 'Normal' },
        spo2: { spo2: 98, pulse: 74, status: 'Normal' },
      },
    ],
  },
  {
    patientId: 'TC-P003',
    name: 'Sushila Kumari',
    age: 35,
    sex: 'Female',
    village: 'Mahua',
    testSessions: [
      {
        timestamp: '2026-08-16T08:25:00Z',
        deviceId: 'TC001',
        operatorName: 'Anjali Singh',
        overallStatus: 'Flagged',
        hb: { value: 8.7, unit: 'g/dL', status: 'Moderate Anemia' },
        urine: { glucose: 'Negative', protein: 'Trace', ph: 6.4, status: 'Normal' },
        spo2: { spo2: 96, pulse: 82, status: 'Normal' },
      },
    ],
  },
  {
    patientId: 'TC-P004',
    name: 'Mohan Prasad',
    age: 52,
    sex: 'Male',
    village: 'Kothi',
    testSessions: [
      {
        timestamp: '2026-08-16T11:05:00Z',
        deviceId: 'TC001',
        operatorName: 'Priya Kumari',
        overallStatus: 'Normal',
        hb: { value: 14.0, unit: 'g/dL', status: 'Normal' },
        urine: { glucose: 'Negative', protein: 'Negative', ph: 6.7, status: 'Normal' },
        spo2: { spo2: 99, pulse: 72, status: 'Normal' },
      },
    ],
  },
  {
    patientId: 'TC-P005',
    name: 'Farzana Khatoon',
    age: 24,
    sex: 'Female',
    village: 'Sunderpur',
    testSessions: [
      {
        timestamp: '2026-08-17T14:20:00Z',
        deviceId: 'TC001',
        operatorName: 'Rekha Devi',
        overallStatus: 'Flagged',
        hb: { value: 9.9, unit: 'g/dL', status: 'Mild Anemia' },
        urine: { glucose: 'Negative', protein: 'Trace', ph: 6.5, status: 'Normal' },
        spo2: { spo2: 95, pulse: 80, status: 'Normal' },
      },
    ],
  },
]

export default mockData