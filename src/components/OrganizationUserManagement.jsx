import { useState } from 'react'
import { Pencil, Trash2, UserPlus } from 'lucide-react'
import { deleteUser, getUsers, saveUser } from '../data/storage'

const emptyForm = () => ({
  id: '',
  name: '',
  email: '',
  location: '',
  phone: '',
  status: 'Active',
  role: 'Field Health Worker',
})

function OrganizationUserManagement() {
  const [users, setUsers] = useState(getUsers)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm())
  }

  function submit(event) {
    event.preventDefault()
    const user = {
      ...form,
      id: editingId || form.id || `WORKER${String(users.length + 1).padStart(3, '0')}`,
    }
    saveUser(user)
    setUsers(getUsers())
    window.dispatchEvent(new Event('healthnext:users-updated'))
    resetForm()
  }

  function editUser(user) {
    setEditingId(user.id)
    setForm({ ...user, location: user.location || user.district || '' })
  }

  function removeUser(user) {
    if (!window.confirm(`Remove ${user.name} from this organization?`)) return
    deleteUser(user.id)
    setUsers(getUsers())
    window.dispatchEvent(new Event('healthnext:users-updated'))
    if (editingId === user.id) resetForm()
  }

  return (
    <>
      <div className="page-header">
        <span className="eyebrow">ORGANIZATION</span>
        <h1>User Management</h1>
        <p>Add, update, or remove users who belong to this organization.</p>
      </div>

      <section className="form-card organization-user-form">
        <div className="section-title">
          <div>
            <h2>{editingId ? 'Edit user details' : 'Add organization user'}</h2>
            <p>Enter the user details, then save them to the organization.</p>
          </div>
          <UserPlus size={21} className="muted-icon" />
        </div>
        <form className="form-grid" onSubmit={submit}>
          <label className="field"><span>Emp ID</span><input name="id" value={form.id} onChange={updateField} placeholder="Auto-generated" readOnly={Boolean(editingId)} /></label>
          <label className="field"><span>Name *</span><input name="name" value={form.name} onChange={updateField} placeholder="Full name" required /></label>
          <label className="field"><span>Email *</span><input type="email" name="email" value={form.email} onChange={updateField} placeholder="name@healthnext.org" required /></label>
          <label className="field"><span>Location *</span><input name="location" value={form.location} onChange={updateField} placeholder="Assigned location" required /></label>
          <label className="field"><span>Contact *</span><input name="phone" value={form.phone} onChange={updateField} placeholder="Phone number" required /></label>
          <label className="field"><span>Role *</span><select name="role" value={form.role} onChange={updateField}><option>Field Health Worker</option><option>Clinical Reviewer</option><option>Organization Manager</option></select></label>
          <label className="field"><span>Status *</span><select name="status" value={form.status} onChange={updateField}><option>Active</option><option>Inactive</option></select></label>
          <div className="form-actions full-width"><button className="button button-primary" type="submit">{editingId ? 'Save changes' : 'Add user'}</button>{editingId && <button className="button button-secondary" type="button" onClick={resetForm}>Cancel</button>}</div>
        </form>
      </section>

      <section className="organization-user-table" aria-labelledby="organization-users-title">
        <div className="list-heading"><div><h2 id="organization-users-title">User details</h2><p>{users.length} users registered</p></div></div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Emp ID</th><th>Email</th><th>Location</th><th>Name</th><th>Status</th><th>Action</th><th>Contact</th></tr></thead>
            <tbody>{users.map((user) => <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.location || user.district || 'Not assigned'}</td>
              <td><strong>{user.name}</strong><small>{user.role}</small></td>
              <td><span className={`status-tag ${user.status === 'Active' ? '' : 'new'}`}>{user.status}</span></td>
              <td><div className="table-actions"><button type="button" title="Edit user" aria-label={`Edit ${user.name}`} onClick={() => editUser(user)}><Pencil size={16} /></button><button type="button" title="Delete user" aria-label={`Delete ${user.name}`} onClick={() => removeUser(user)}><Trash2 size={16} /></button></div></td>
              <td>{user.phone}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default OrganizationUserManagement
