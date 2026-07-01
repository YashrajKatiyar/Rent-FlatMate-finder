import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TenantProfile() {
  const [form, setForm] = useState({
    preferredLocation: '',
    budgetMin: '',
    budgetMax: '',
    moveInDate: '',
    notes: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/tenant/profile')
      .then((res) => {
        const p = res.data.data;
        setForm({
          preferredLocation: p.preferredLocation,
          budgetMin: p.budgetMin,
          budgetMax: p.budgetMax,
          moveInDate: p.moveInDate?.slice(0, 10) || '',
          notes: p.notes || '',
        });
      })
      .catch(() => {
        // No profile yet — that's fine, user will create one
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.post('/tenant/profile', form);
      setMessage('Profile saved. Compatibility scores will be recalculated on your next browse.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>My Tenant Profile</h2>
      <p className="hint">This drives your AI compatibility score against room listings.</p>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
      <form className="card-form" onSubmit={handleSubmit}>
        <label>Preferred Location</label>
        <input
          required
          value={form.preferredLocation}
          onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })}
        />
        <div className="row">
          <div>
            <label>Budget Min</label>
            <input
              type="number"
              required
              min={0}
              value={form.budgetMin}
              onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
            />
          </div>
          <div>
            <label>Budget Max</label>
            <input
              type="number"
              required
              min={0}
              value={form.budgetMax}
              onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
            />
          </div>
        </div>
        <label>Move-in Date</label>
        <input
          type="date"
          required
          value={form.moveInDate}
          onChange={(e) => setForm({ ...form, moveInDate: e.target.value })}
        />
        <label>Notes (optional)</label>
        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
