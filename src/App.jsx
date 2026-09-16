import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BarChart3, Bluetooth, Check, ChevronDown, Eye, EyeOff, FileText, HeartPulse, Home, LogOut, Menu, MonitorSmartphone, Plus, Settings, ShieldCheck, UserCog, UserRound, Users, X } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PatientProvider } from './context/PatientContext'
import { createId, findPatientByNameAndPhone, nextPatientId, savePatient } from './data/storage'
import { connectHealthNextDevice, isBluetoothSupported, disconnectHealthNextDevice } from './data/device'
import EmployeeDashboard from './components/EmployeeDashboard'
import EmployeePatientsTable from './components/EmployeePatientsTable'
import { PatientGenerateReport, PatientAnalysis } from './components/PatientWorkflowPages'
import { AdminDashboard, UserManagement, PatientDetails } from './components/AdminPages'
import './App.css'

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/create-session', label: 'Create Session', icon: Plus },
  { path: '/patients', label: 'Patients Data', icon: Users },
  { path: '/generate-report', label: 'Generate Report', icon: FileText },
  { path: '/report-analysis', label: 'Report Analysis', icon: BarChart3 },
]
const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: Home },
  { path: '/admin/users', label: 'User Management', icon: UserCog },
  { path: '/admin/patients', label: 'Patient Details', icon: Users },
]
const fields = [
  ['hemoglobin', 'Hemoglobin', 'g/dL', 'e.g. 12.4'], ['glucose', 'Glucose', 'mg/dL', 'e.g. 94'], ['ph', 'pH', '', 'e.g. 6.5'],
  ['protein', 'Protein', '', 'e.g. Negative or Trace'], ['bloodPressure', 'Blood Pressure', 'mmHg', 'e.g. 120/80'], ['spo2', 'SpO2 / Oxygen Level', '%', 'e.g. 98'],
]

function navigate(path) { window.history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')) }
function formatDate(value) { return value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Not recorded' }
function Logo({ compact = false }) { return <div className="brand"><span className="brand-mark"><HeartPulse size={compact ? 18 : 22} /></span><span><strong>HealthNext</strong>{!compact && <small>Diagnostic Hub</small>}</span></div> }
function Button({ children, variant = 'primary', icon: Icon, ...props }) { return <button className={`button button-${variant}`} {...props}>{Icon && <Icon size={17} />}{children}</button> }
function Field({ label, name, value, onChange, error, type = 'text', placeholder, required = false, readOnly = false }) { return <label className="field"><span>{label}{required && <b> *</b>}</span><input type={type} name={name} value={value ?? ''} onChange={onChange} placeholder={placeholder} aria-invalid={Boolean(error)} readOnly={readOnly || name === 'id'} />{error && <em>{error}</em>}</label> }
function PageHeader({ eyebrow, title, subtitle }) { return <div className="page-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></div> }

function Login() {
  const { worker, login } = useAuth(); const [accountType, setAccountType] = useState('employee'); const [form, setForm] = useState({ identifier: '', password: '' }); const [error, setError] = useState(''); const [show, setShow] = useState(false); const [loading, setLoading] = useState(false)
  useEffect(() => { if (worker) navigate(worker.accountType === 'admin' ? '/admin' : '/') }, [worker])
  function chooseAccount(type) { setAccountType(type); setForm({ identifier: '', password: '' }); setError(''); setShow(false) }
  function submit(event) { event.preventDefault(); setError(''); if (!form.identifier || !form.password) return setError(`Enter your ${accountType === 'admin' ? 'Organization Email' : 'Worker ID'} and password.`); setLoading(true); window.setTimeout(() => { const result = login(form.identifier, form.password, accountType); if (!result.success) setError(result.error); setLoading(false) }, 350) }
  const isAdmin = accountType === 'admin'
  return <div className="login-page"><div className="login-aside"><Logo /><div><span className="eyebrow">HEALTHNEXT ACCESS</span><h1>Smarter screening.<br /><i>Stronger decisions.</i></h1></div><div className="aside-note"><ShieldCheck size={18} /><span>Designed for secure, structured records</span></div></div><main className="login-card"><Logo compact /><div className="login-copy"><h2>Welcome back</h2><p>Choose your workspace to continue.</p></div><div className="account-switcher" role="tablist" aria-label="Choose account type"><button type="button" className={!isAdmin ? 'selected' : ''} onClick={() => chooseAccount('employee')} role="tab" aria-selected={!isAdmin}><HeartPulse size={17} /><span><strong>Employee</strong><small>Field operations</small></span></button><button type="button" className={isAdmin ? 'selected' : ''} onClick={() => chooseAccount('admin')} role="tab" aria-selected={isAdmin}><UserCog size={17} /><span><strong>Organization</strong><small>Program oversight</small></span></button></div><form onSubmit={submit}><Field label={isAdmin ? 'Organization Email' : 'Worker ID or Email'} name="identifier" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder={isAdmin ? 'admin@healthnext.example' : 'WORKER001'} required /><label className="field"><span>Password *</span><div className="password-wrap"><input type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Enter your password" /><button type="button" className="input-action" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><label className="checkbox"><input type="checkbox" defaultChecked /> <span>Remember me on this device</span></label>{error && <div className="feedback error">{error}</div>}<Button type="submit" disabled={loading}>{loading ? 'Signing in...' : `Sign in as ${isAdmin ? 'organization' : 'employee'}`} {!loading && <ArrowRight size={17} />}</Button></form><p className="demo-hint">Demo access: <strong>{isAdmin ? 'admin01.demo@healthnext.example / Test@123' : 'WORKER001 / worker123'}</strong></p></main></div>
}

function ProfileMenu() {
  const { worker, logout } = useAuth(); const [open, setOpen] = useState(false); const ref = useRef(null)
  useEffect(() => { function close(event) { if (ref.current && !ref.current.contains(event.target)) setOpen(false) } function escape(event) { if (event.key === 'Escape') setOpen(false) } document.addEventListener('mousedown', close); document.addEventListener('keydown', escape); return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape) } }, [])
  return <div className="profile-wrap" ref={ref}><button className="profile-trigger" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="menu"><span className="avatar">{worker.name.charAt(0)}</span><span className="profile-name"><strong>{worker.name}</strong><small>{worker.role}</small></span><ChevronDown size={16} /></button>{open && <div className="profile-menu"><div className="menu-person"><span className="avatar large">{worker.name.charAt(0)}</span><div><strong>{worker.name}</strong><small>{worker.id}</small></div></div><button onClick={() => navigate('/profile')}><UserRound size={16} /> Profile</button><button><Settings size={16} /> Settings</button><button className="logout" onClick={() => { logout(); navigate('/login') }}><LogOut size={16} /> Logout</button></div>}</div>
}

function Shell({ children, path }) {
  const { worker } = useAuth(); const visibleNavItems = worker.accountType === 'admin' ? adminNavItems : navItems; const [mobileOpen, setMobileOpen] = useState(false); const [deviceState, setDeviceState] = useState({ status: isBluetoothSupported() ? 'disconnected' : 'unsupported', device: null, message: '' }); 
  const deviceReadyRef = useRef(false);
  
  useEffect(() => {
    function handleMessage(e) {
      const msg = e.detail;
      if (msg && (msg.type === 'DEVICE_READY' || msg.type === 'DEVICE_STATUS')) {
        deviceReadyRef.current = true;
        const messageText = msg.readyForTest === false ? 'Device busy.' : 'Device ready.';
        setDeviceState(prev => (prev.status === 'connecting' || prev.status === 'waiting' || prev.status === 'ready') ? { ...prev, status: 'ready', message: messageText } : prev);
      }
    }
    window.addEventListener('healthnext-device-message', handleMessage);
    return () => window.removeEventListener('healthnext-device-message', handleMessage);
  }, []);

  const device = deviceState.status === 'ready' ? `Ready: ${deviceState.device?.name || 'HealthNext device'}` : deviceState.status === 'waiting' ? `Waiting: ${deviceState.device?.name || 'HealthNext device'}` : deviceState.status === 'unsupported' ? 'Bluetooth not supported' : 'No device connected'
  
  async function linkDevice() { 
    if (deviceState.status === 'unsupported') return setDeviceState({ ...deviceState, message: 'Bluetooth device linking is not supported in this browser. Please use a compatible browser/device.' }); 
    setDeviceState({ ...deviceState, status: 'connecting', message: '' }); 
    deviceReadyRef.current = false;
    try { 
      const result = await connectHealthNextDevice(); 
      result.device.addEventListener('gattserverdisconnected', () => {
        disconnectHealthNextDevice();
        setDeviceState({ status: 'disconnected', device: null, message: 'Device disconnected.' })
      }); 
      if (deviceReadyRef.current) {
        setDeviceState({ status: 'ready', device: result.device, message: 'Device ready.' }) 
      } else {
        setDeviceState({ status: 'waiting', device: result.device, message: 'Connected. Waiting for device...' }) 
      }
    } catch (connectionError) { 
      setDeviceState({ status: 'disconnected', device: null, message: connectionError.name === 'NotFoundError' ? '' : connectionError.message }) 
    } 
  }
  
  function disconnectDevice() { 
    disconnectHealthNextDevice(); 
    setDeviceState({ status: isBluetoothSupported() ? 'disconnected' : 'unsupported', device: null, message: '' }) 
  }
  
  return <div className="app-shell"><aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}><div className="sidebar-top"><Logo compact /><button className="close-mobile" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div><nav>{visibleNavItems.map(({ path: itemPath, label, icon: Icon }) => <button key={itemPath} className={path === itemPath ? 'active' : ''} onClick={() => { navigate(itemPath); setMobileOpen(false) }}><Icon size={19} /><span>{label}</span></button>)}</nav><div className="sidebar-footer"><MonitorSmartphone size={17} /><span>{device}</span></div></aside>{mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /> }<div className="main-shell"><header className="topbar"><button className="menu-toggle" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={22} /></button><button className="header-device" onClick={deviceState.status === 'ready' || deviceState.status === 'waiting' ? disconnectDevice : linkDevice} disabled={deviceState.status === 'connecting'} title={deviceState.message || 'Link a HealthNext device'}><i />{deviceState.status === 'connecting' ? 'Connecting...' : deviceState.status === 'ready' || deviceState.status === 'waiting' ? device : deviceState.status === 'unsupported' ? 'Bluetooth not supported' : 'Link Device'}<Bluetooth size={14} /></button><div className="topbar-brand"><Logo /></div><ProfileMenu /></header><main className="content">{deviceState.message && <div className="feedback error">{deviceState.message}</div>}{children}</main></div></div>
}

function CreateSession() { const { worker } = useAuth(); const [step, setStep] = useState(1); const [patient, setPatient] = useState({ id: nextPatientId(), name: '', age: '', gender: '', phone: '', email: '', address: '', medicalHistory: '' }); const [readings, setReadings] = useState(Object.fromEntries(fields.map(([name]) => [name, '']))); const [errors, setErrors] = useState({}); const [existing, setExisting] = useState(null); const [complete, setComplete] = useState(null)
  function change(event) { const { name, value } = event.target; const nextPatient = { ...patient, [name]: value }; if (name === 'name' || name === 'phone') { const found = nextPatient.name && nextPatient.phone ? findPatientByNameAndPhone(nextPatient.name, nextPatient.phone) : null; setExisting(found || (nextPatient.name && nextPatient.phone ? 'new' : null)); if (found) return setPatient(found) } setPatient(nextPatient) }
  function validatePatient() { const required = ['name', 'phone', 'age', 'gender']; const next = Object.fromEntries(required.filter((name) => !patient[name]).map((name) => [name, 'This field is required.'])); setErrors(next); return !Object.keys(next).length }
  function validateReadings() { const next = {}; fields.forEach(([name]) => { if (!readings[name]) next[name] = 'Enter a value.' }); setErrors(next); return !Object.keys(next).length }
  function save() { const now = new Date().toISOString(); const savedPatient = { ...patient, age: Number(patient.age), createdAt: existing && existing !== 'new' ? existing.createdAt : now, testHistory: existing && existing !== 'new' ? existing.testHistory : [] }; const session = { sessionId: createId('SESSION'), date: now, workerId: worker.id, workerName: worker.name, deviceId: 'HN-BLE-001', ...readings }; savedPatient.testHistory = [...savedPatient.testHistory, session]; savePatient(savedPatient); setComplete({ patient: savedPatient, session }); setStep(4) }
  if (complete) return <div className="success-state"><span className="success-icon"><Check size={30} /></span><PageHeader eyebrow="SESSION COMPLETE" title="Diagnostic session completed successfully." subtitle={`${complete.patient.name} has been added to the patient history.`} /><div className="detail-card"><div><span>Session ID</span><strong>{complete.session.sessionId}</strong></div><div><span>Patient</span><strong>{complete.patient.id} · {complete.patient.name}</strong></div><div><span>Recorded</span><strong>{formatDate(complete.session.date)}</strong></div></div><div className="form-actions"><Button variant="secondary" onClick={() => { setComplete(null); setStep(1); setPatient({ id: '', name: '', age: '', gender: '', phone: '', email: '', address: '', medicalHistory: '' }); setReadings(Object.fromEntries(fields.map(([name]) => [name, '']))) }}>Start another session</Button><Button onClick={() => navigate('/patients')}>View patients <ArrowRight size={17} /></Button></div></div>
  return <><PageHeader eyebrow="NEW WORKFLOW" title="Create diagnostic session" subtitle="Identify the patient, record readings, and review the session before saving." /><div className="stepper">{['Patient', 'Test Readings', 'Review', 'Complete'].map((label, index) => <div className={step >= index + 1 ? 'step active' : 'step'} key={label}><span>{index + 1}</span>{label}</div>)}</div><section className="form-card">{step === 1 && <><div className="section-title"><div><h2>Patient identification</h2><p>Search by Patient ID to continue an existing history or create a new record.</p></div>{existing && <span className={`status-tag ${existing === 'new' ? 'new' : ''}`}>{existing === 'new' ? 'New Patient' : 'Existing Patient'}</span>}</div><div className="form-grid"><Field label="Patient ID" name="id" value={patient.id} onChange={change} error={errors.id} placeholder="e.g. P001" required /><Field label="Patient Name" name="name" value={patient.name} onChange={change} error={errors.name} placeholder="Full name" required /><Field label="Age" name="age" type="number" value={patient.age} onChange={change} error={errors.age} placeholder="Years" required /><label className="field"><span>Gender *</span><select name="gender" value={patient.gender} onChange={change}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Non-binary</option><option>Prefer not to say</option></select>{errors.gender && <em>{errors.gender}</em>}</label><Field label="Phone" name="phone" value={patient.phone} onChange={change} placeholder="Optional" /><Field label="Email" name="email" type="email" value={patient.email} onChange={change} placeholder="Optional" /><Field label="Address" name="address" value={patient.address} onChange={change} placeholder="Optional" /><Field label="Medical History" name="medicalHistory" value={patient.medicalHistory} onChange={change} placeholder="Optional" /></div>{existing && existing !== 'new' && <div className="inline-note"><Check size={16} /> Previous test: {formatDate(existing.testHistory.at(-1)?.date)}. A new session will be appended.</div>}<div className="form-actions"><Button onClick={() => validatePatient() && setStep(2)}>Continue <ArrowRight size={17} /></Button></div></>}{step === 2 && <><div className="section-title"><div><h2>Test readings</h2><p>Enter recorded measurements. These values are stored as provided and are not interpreted.</p></div><span className="status-tag">Manual entry</span></div><div className="form-grid">{fields.map(([name, label, unit, placeholder]) => <label className="field" key={name}><span>{label} {unit && <small>({unit})</small>} *</span><input name={name} value={readings[name]} onChange={(e) => setReadings({ ...readings, [name]: e.target.value })} placeholder={placeholder} />{errors[name] && <em>{errors[name]}</em>}</label>)}</div><div className="form-actions"><Button variant="secondary" onClick={() => setStep(1)}>Back</Button><Button onClick={() => validateReadings() && setStep(3)}>Review <ArrowRight size={17} /></Button></div></>}{step === 3 && <><div className="section-title"><div><h2>Review session</h2><p>Confirm the details below before saving this diagnostic session.</p></div></div><div className="review-block"><h3>Patient details</h3><div className="review-grid">{[['Patient ID', patient.id], ['Name', patient.name], ['Age', `${patient.age} years`], ['Gender', patient.gender]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div><div className="review-block"><h3>Readings · {formatDate(new Date())}</h3><div className="review-grid readings">{fields.map(([name, label, unit]) => <div key={name}><span>{label}</span><strong>{readings[name]} {unit}</strong></div>)}</div></div><div className="form-actions"><Button variant="secondary" onClick={() => { setStep(1); setErrors({}) }}>Reset</Button><Button variant="ghost" onClick={() => navigate('/')}>Cancel</Button><Button onClick={save}>Save Test Results <Check size={17} /></Button></div></>}</section></>
}

function Profile() { const { worker, logout } = useAuth(); return <><PageHeader eyebrow="ACCOUNT" title="Profile" subtitle="Your HealthNext worker account details." /><div className="profile-card"><span className="avatar profile-avatar">{worker.name.charAt(0)}</span><div className="profile-detail"><h2>{worker.name}</h2><p>{worker.role}</p><div className="detail-card"><div><span>Worker ID</span><strong>{worker.id}</strong></div><div><span>Email</span><strong>{worker.email}</strong></div><div><span>Role</span><strong>{worker.role}</strong></div></div><Button variant="secondary" onClick={() => { logout(); navigate('/login') }} icon={LogOut}>Log out</Button></div></div></> }

function Router() { const { worker } = useAuth(); const [path, setPath] = useState(window.location.pathname); useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, []); useEffect(() => { const protectedPath = path !== '/login'; if (!worker && protectedPath) navigate('/login'); if (worker && path === '/login') navigate(worker.accountType === 'admin' ? '/admin' : '/') }, [path, worker]); if (!worker) return <Login />; const pages = worker.accountType === 'admin' ? { '/admin': <AdminDashboard />, '/admin/users': <UserManagement />, '/admin/patients': <PatientDetails />, '/profile': <Profile /> } : { '/': <EmployeeDashboard />, '/create-session': <CreateSession />, '/patients': <EmployeePatientsTable />, '/generate-report': <PatientGenerateReport />, '/report-analysis': <PatientAnalysis />, '/profile': <Profile /> }; return <Shell path={path}>{pages[path] || (worker.accountType === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />)}</Shell> }
function App() { return <AuthProvider><PatientProvider><Router /></PatientProvider></AuthProvider> }

export default App
