import { getPatients } from '../data/storage'

function formatDate(value) {
  return value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not recorded'
}

function EmployeePatientsTable() {
  const patients = getPatients()
  const rows = patients.flatMap((patient) => (patient.testHistory || []).map((session) => ({ patient, session })))

  return (
    <>
      <div className="page-header">
        <span className="eyebrow">RECORDS</span>
        <h1>Patients Data</h1>
        <p>Registered patients and their diagnostic history.</p>
      </div>
      <section className="employee-patient-table" aria-labelledby="employee-patients-title">
        <div className="list-heading"><div><h2 id="employee-patients-title">Patient test records</h2><p>{rows.length} tests recorded</p></div></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Patient</th><th>Patient ID</th><th>Age/Gender</th><th>Contact</th><th>Worker</th><th>Date &amp; time</th><th>Device ID</th><th>Readings</th></tr></thead>
            <tbody>{rows.map(({ patient, session }) => <tr key={session.sessionId}>
              <td><strong>{patient.name}</strong></td>
              <td>{patient.id}</td>
              <td>{patient.age} / {patient.gender}</td>
              <td>{patient.phone}</td>
              <td>{session.workerName || 'Not recorded'}</td>
              <td>{formatDate(session.date)}</td>
              <td>{session.deviceId || 'Not recorded'}</td>
              <td className="reading-cell">Hb {session.hemoglobin} · Glucose {session.glucose} · pH {session.ph} · SpO2 {session.spo2}%</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default EmployeePatientsTable
