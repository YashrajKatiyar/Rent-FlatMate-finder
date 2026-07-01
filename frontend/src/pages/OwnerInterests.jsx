import { useState, useEffect } from 'react';
import api from '../services/api';

export default function OwnerInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/interests/received');
      setInterests(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const respond = async (id, decision) => {
    await api.patch(`/interests/${id}`, { decision });
    fetchInterests();
  };

  if (loading) return <p className="page">Loading...</p>;

  return (
    <div className="page">
      <h2>Received Interest Requests</h2>
      {interests.length === 0 ? (
        <p>No interest requests yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Listing</th>
              <th>Compatibility</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {interests.map((i) => (
              <tr key={i._id}>
                <td>{i.tenant?.name} ({i.tenant?.email})</td>
                <td>{i.listing?.location} · ₹{i.listing?.rent}</td>
                <td>{i.compatibilityScore ? `${i.compatibilityScore.score}/100` : '—'}</td>
                <td>
                  <span className={`status-pill ${i.status}`}>{i.status}</span>
                </td>
                <td>
                  {i.status === 'pending' && (
                    <>
                      <button onClick={() => respond(i._id, 'accepted')}>Accept</button>
                      <button className="secondary" onClick={() => respond(i._id, 'declined')}>
                        Decline
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
