import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TenantDashboard() {
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({ location: '', minRent: '', maxRent: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interestSentIds, setInterestSentIds] = useState(new Set());

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.location) params.location = filters.location;
      if (filters.minRent) params.minRent = filters.minRent;
      if (filters.maxRent) params.maxRent = filters.maxRent;
      const res = await api.get('/listings', { params });
      setResults(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const expressInterest = async (listingId) => {
    try {
      await api.post('/interests', { listingId });
      setInterestSentIds((prev) => new Set(prev).add(listingId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send interest');
    }
  };

  return (
    <div className="page">
      <h2>Browse Listings</h2>
      <form className="filter-bar" onSubmit={handleFilter}>
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <input
          type="number"
          placeholder="Min Rent"
          value={filters.minRent}
          onChange={(e) => setFilters({ ...filters, minRent: e.target.value })}
        />
        <input
          type="number"
          placeholder="Max Rent"
          value={filters.maxRent}
          onChange={(e) => setFilters({ ...filters, maxRent: e.target.value })}
        />
        <button type="submit">Filter</button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <div className="listing-grid">
          {results.map(({ listing, compatibility }) => (
            <div className="listing-card" key={listing._id}>
              {compatibility && (
                <div className={`score-badge ${compatibility.score >= 80 ? 'high' : compatibility.score >= 50 ? 'mid' : 'low'}`}>
                  {compatibility.score}/100 match
                </div>
              )}
              <h3>{listing.location}</h3>
              <p>₹{listing.rent}/mo · {listing.roomType} · {listing.furnishingStatus}</p>
              <p className="muted">Available from {new Date(listing.availableFrom).toLocaleDateString()}</p>
              {listing.description && <p>{listing.description}</p>}
              {compatibility && <p className="explanation">{compatibility.explanation}</p>}
              <p className="muted">Owner: {listing.owner?.name}</p>
              <button
                disabled={interestSentIds.has(listing._id)}
                onClick={() => expressInterest(listing._id)}
              >
                {interestSentIds.has(listing._id) ? 'Interest Sent' : 'Express Interest'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
