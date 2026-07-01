import { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [activity, setActivity] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [tab, setTab] = useState('overview');

  const load = async () => {
    const [a, u, l] = await Promise.all([
      api.get('/admin/activity'),
      api.get('/admin/users'),
      api.get('/admin/listings'),
    ]);
    setActivity(a.data.data);
    setUsers(u.data.data);
    setListings(l.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleUser = async (u) => {
    const path = u.isActive ? 'deactivate' : 'reactivate';
    await api.patch(`/admin/users/${u._id}/${path}`);
    load();
  };

  const removeListing = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/admin/listings/${id}`);
    load();
  };

  return (
    <div className="page">
      <h2>Admin Panel</h2>
      <div className="tabs">
        <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>
          Overview
        </button>
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
          Users
        </button>
        <button className={tab === 'listings' ? 'active' : ''} onClick={() => setTab('listings')}>
          Listings
        </button>
      </div>

      {tab === 'overview' && activity && (
        <div className="stat-grid">
          {Object.entries(activity).map(([key, val]) => (
            <div className="stat-card" key={key}>
              <span className="stat-value">{val}</span>
              <span className="stat-label">{key.replace(/([A-Z])/g, ' $1')}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.isActive ? 'Active' : 'Deactivated'}</td>
                <td>
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleUser(u)}>{u.isActive ? 'Deactivate' : 'Reactivate'}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'listings' && (
        <table className="table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Rent</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l._id}>
                <td>{l.location}</td>
                <td>₹{l.rent}</td>
                <td>{l.owner?.name}</td>
                <td>{l.status}</td>
                <td>
                  <button className="secondary" onClick={() => removeListing(l._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
