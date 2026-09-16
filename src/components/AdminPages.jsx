import { useState, useEffect } from 'react';
import { ArrowRight, UserCog, Users, Pencil, Trash2, UserPlus } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

// Duplicated simple components from App.jsx for simplicity
function formatDate(value) { return value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not recorded' }
function Button({ children, variant = 'primary', icon: Icon, onClick, type = 'button', disabled }) { return <button type={type} className={`button button-${variant}`} onClick={onClick} disabled={disabled}>{Icon && <Icon size={17} />}{children}</button> }
function Field({ label, name, value, onChange, error, type = 'text', placeholder, required = false, readOnly = false }) { return <label className="field"><span>{label}{required && <b> *</b>}</span><input type={type} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} aria-invalid={Boolean(error)} readOnly={readOnly || name === 'id'} />{error && <em>{error}</em>}</label> }
function PageHeader({ eyebrow, title, subtitle }) { return <div className="page-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div> }

export function AdminDashboard({ navigate }) {
  const { worker } = useAuth();
  const [metrics, setMetrics] = useState({ workers: '-', screenings: '-' });

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const usersQ = query(collection(firestore, 'users'), where('organisationId', '==', worker.organisationId));
        const usersSnap = await getDocs(usersQ);
        const testsQ = query(collection(firestore, 'tests'), where('organisationId', '==', worker.organisationId));
        const testsSnap = await getDocs(testsQ);

        setMetrics({
          workers: usersSnap.docs.length,
          screenings: testsSnap.docs.length,
        });
      } catch (e) {
        console.error("Failed to fetch metrics:", e);
      }
    }
    fetchMetrics();
  }, [worker.organisationId]);

  const cards = [
    { title: 'User Management', description: 'Add, update, or remove users in your organization.', icon: UserCog, path: '/admin/users' },
    { title: 'Patient Details', description: 'Review patient tests, workers, timestamps, and device IDs.', icon: Users, path: '/admin/patients' }
  ];
  return (
    <>
      <PageHeader eyebrow="ORGANIZATION WORKSPACE" title="Organization dashboard" subtitle="Choose a management area to continue." />
      <div className="admin-metrics">
        <div><span>Active workers</span><strong>{metrics.workers}</strong><small>Live from Firebase</small></div>
        <div><span>Screenings</span><strong>{metrics.screenings}</strong><small>Live from Firebase</small></div>
        <div><span>Reports generated</span><strong>-</strong><small>Ready for review</small></div>
      </div>
      <section className="feature-grid admin-feature-grid">
        {cards.map(({ title, description, icon: Icon, path }) => (
          <button className="feature-card" key={path} onClick={() => navigate(path)}>
            <span className="feature-icon"><Icon size={22} /></span>
            <span className="feature-body"><strong>{title}</strong><span>{description}</span></span>
            <ArrowRight className="feature-arrow" size={19} />
          </button>
        ))}
      </section>
    </>
  );
}

export function UserManagement() { 
  const { worker } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const q = query(collection(firestore, 'users'), where('organisationId', '==', worker.organisationId));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        setUsers(fetched);
      } catch (e) {
        console.error("Failed to fetch users:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [worker.organisationId]);

  return (
    <>
      <PageHeader eyebrow="ORGANIZATION" title="User Management" subtitle="View and manage users who belong to this organization." />
      <div className="management-layout">
        <section className="form-card">
          <div className="section-title">
            <div>
              <h2>Add organization user</h2>
              <p>Keep identity, role, and field assignment information current.</p>
            </div>
            <UserPlus size={21} className="muted-icon" />
          </div>
          <div className="feedback warning" style={{marginBottom: '1rem'}}>
            <strong>Secure Action Required</strong>
            <p style={{marginTop: '0.25rem'}}>New employee accounts must be provisioned securely through the backend to avoid replacing your current session. This feature is currently in read-only mode.</p>
          </div>
          <form className="form-grid" onSubmit={e => e.preventDefault()}>
            <Field label="User ID" name="id" value="" onChange={()=>{}} placeholder="Auto-generated" readOnly />
            <Field label="Full name" name="name" value="" onChange={()=>{}} placeholder="Full name" readOnly />
            <Field label="Email" name="email" type="email" value="" onChange={()=>{}} placeholder="name@healthnext.org" readOnly />
            <Field label="Phone" name="phone" value="" onChange={()=>{}} placeholder="Phone number" readOnly />
            <label className="field"><span>Role</span><select disabled><option>Field Health Worker</option></select></label>
            <Field label="District" name="district" value="" onChange={()=>{}} placeholder="Assigned district" readOnly />
            <label className="field"><span>Status</span><select disabled><option>Active</option></select></label>
            <div className="form-actions full-width">
              <Button type="button" icon={UserPlus} disabled>Add user (Backend required)</Button>
            </div>
          </form>
        </section>
        
        <section className="management-list">
          <div className="list-heading">
            <div>
              <h2>Organization users</h2>
              <p>{loading ? 'Loading...' : `${users.length} users registered`}</p>
            </div>
          </div>
          {users.map((user) => (
            <article className="user-row" key={user.id}>
              <span className="avatar">{user.name?.charAt(0) || '?'}</span>
              <div className="user-main">
                <strong>{user.name || 'Unnamed'}</strong>
                <span>{user.userId || user.id} &middot; {user.email || 'No email'}</span>
                <small>{user.role} &middot; {user.district || 'No district'} &middot; Joined {formatDate(user.createdAt)}</small>
              </div>
              <span className={`status-tag ${user.status === 'ACTIVE' ? '' : 'new'}`}>{user.status}</span>
              <div className="row-actions">
                <button type="button" title="Edit user (Disabled)" disabled aria-label={`Edit ${user.name}`}><Pencil size={16} /></button>
                <button type="button" title="Delete user (Disabled)" disabled aria-label={`Delete ${user.name}`}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </>
  ); 
}

export function PatientDetails() { 
  const { worker } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const testsQ = query(collection(firestore, 'tests'), where('organisationId', '==', worker.organisationId));
        const testsSnap = await getDocs(testsQ);
        const fetchedTests = testsSnap.docs.map(d => ({ ...d.data(), id: d.id }));

        const resultsQ = query(collection(firestore, 'results'), where('organisationId', '==', worker.organisationId));
        const resultsSnap = await getDocs(resultsQ);
        const resultsMap = new Map();
        resultsSnap.forEach(d => resultsMap.set(d.data().testId, d.data()));

        const patientsQ = query(collection(firestore, 'patients'));
        const patientsSnap = await getDocs(patientsQ);
        const patientsMap = new Map();
        patientsSnap.forEach(d => patientsMap.set(d.id, d.data()));

        const compiled = fetchedTests.map(test => {
          const patient = patientsMap.get(test.patientId) || { name: 'Unknown', id: test.patientId, age: '?', gender: '?', phone: '?' };
          const result = resultsMap.get(test.id) || {};
          return { patient, test, result };
        }).sort((a, b) => new Date(b.test.createdAt) - new Date(a.test.createdAt));

        setSessions(compiled);
      } catch (e) {
        console.error("Failed to fetch patient details:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [worker.organisationId]);

  return (
    <>
      <PageHeader eyebrow="ORGANIZATION" title="Patient Details" subtitle="Review patient identity, screening readings, worker attribution, and device history." />
      <div className="patient-detail-list">
        {loading ? <p>Loading data...</p> : sessions.map(({ patient, test, result }) => (
          <article className="patient-detail-card" key={test.id}>
            <div className="patient-detail-header">
              <div className="patient-avatar">{patient.name?.charAt(0) || '?'}</div>
              <div>
                <h2>{patient.name}</h2>
                <p>{patient.id} &middot; {patient.age} years &middot; {patient.gender} &middot; {patient.phone}</p>
              </div>
              <span className="status-tag">{test.status}</span>
            </div>
            <div className="patient-meta-grid">
              <div><span>Test date & time</span><strong>{formatDate(test.createdAt)}</strong></div>
              <div><span>Worker ID</span><strong>{test.createdBy || 'Not recorded'}</strong></div>
              <div><span>Device ID</span><strong>{test.deviceId || 'Not recorded'}</strong></div>
              <div><span>Test ID</span><strong>{test.id}</strong></div>
            </div>
            <div className="patient-readings detail-readings">
              <span>Test Type <b>{test.testType}</b></span>
              {test.testType === 'HB' ? (
                <><span>Hb <b>{result.hbValue || '—'} g/dL</b></span><span>Hb Raw <b>{result.hbRaw || '—'}</b></span></>
              ) : (
                <><span>Heart Rate <b>{result.heartRate || '—'} bpm</b></span><span>Temperature <b>{result.temperature || '—'} °C</b></span></>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  ); 
}
