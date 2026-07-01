import { useState, useEffect } from 'react';
import api from '../services/api';

export default function TenantInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/interests/sent')
      .then((res) => setInterests(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page">Loading...</p>;

  return (
    <div className="page">
      <h2>My Interest Requests</h2>
      {interests.length === 0 ? (
        <p>You haven't expressed interest in any listings yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Rent</th>
              <th>Compatibility</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {interests.map((i) => (
              <tr key={i._id}>
                <td>{i.listing?.location}</td>
                <td>₹{i.listing?.rent}</td>
                <td>{i.compatibilityScore ? `${i.compatibilityScore.score}/100` : '—'}</td>
                <td>
                  <span className={`status-pill ${i.status}`}>{i.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
