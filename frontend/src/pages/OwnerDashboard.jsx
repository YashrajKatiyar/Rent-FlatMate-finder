import { useState, useEffect } from 'react';
import api from '../services/api';

const emptyForm = {
  location: '',
  rent: '',
  availableFrom: '',
  roomType: 'single',
  furnishingStatus: 'unfurnished',
  description: '',
};

export default function OwnerDashboard() {
  const [listings, setListings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/listings/mine');
      setListings(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      photos.forEach((file) => data.append('photos', file));
      await api.post('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(emptyForm);
      setPhotos([]);
      fetchListings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const markFilled = async (id) => {
    await api.patch(`/listings/${id}/fill`);
    fetchListings();
  };

  return (
    <div className="page">
      <h2>Post a Room Listing</h2>
      {error && <p className="error">{error}</p>}
      <form className="card-form" onSubmit={handleSubmit}>
        <label>Location</label>
        <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <div className="row">
          <div>
            <label>Rent (₹/mo)</label>
            <input
              type="number"
              required
              min={0}
              value={form.rent}
              onChange={(e) => setForm({ ...form, rent: e.target.value })}
            />
          </div>
          <div>
            <label>Available From</label>
            <input
              type="date"
              required
              value={form.availableFrom}
              onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
            />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Room Type</label>
            <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
              <option value="single">Single</option>
              <option value="shared">Shared</option>
              <option value="studio">Studio</option>
              <option value="1bhk">1 BHK</option>
              <option value="2bhk">2 BHK</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label>Furnishing</label>
            <select
              value={form.furnishingStatus}
              onChange={(e) => setForm({ ...form, furnishingStatus: e.target.value })}
            >
              <option value="furnished">Furnished</option>
              <option value="semi-furnished">Semi-furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>
        </div>
        <label>Description (optional)</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label>Photos (optional, up to 6)</label>
        <input type="file" multiple accept="image/*" onChange={(e) => setPhotos(Array.from(e.target.files))} />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Posting...' : 'Post Listing'}
        </button>
      </form>

      <h2>My Listings</h2>
      {loading ? (
        <p>Loading...</p>
      ) : listings.length === 0 ? (
        <p>No listings yet.</p>
      ) : (
        <div className="listing-grid">
          {listings.map((l) => (
            <div className="listing-card" key={l._id}>
              <div className={`status-pill ${l.status}`}>{l.status}</div>
              <h3>{l.location}</h3>
              <p>₹{l.rent}/mo · {l.roomType} · {l.furnishingStatus}</p>
              <p className="muted">Available from {new Date(l.availableFrom).toLocaleDateString()}</p>
              {l.status === 'active' && <button onClick={() => markFilled(l._id)}>Mark as Filled</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
