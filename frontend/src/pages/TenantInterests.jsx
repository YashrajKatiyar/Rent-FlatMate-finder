import { useState, useEffect } from "react";
import api from "../services/api";
import "./TenantInterests.css";

export default function TenantInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/interests/sent")
      .then((res) => setInterests(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="interest-page">
        <div className="interest-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );

  return (
    <div className="interest-page">
      <div className="interest-card">

        <h1>My Interest Requests</h1>

        <p className="interest-subtitle">
          Track the requests you've sent to room owners.
        </p>

        {interests.length === 0 ? (
          <div className="empty-state">
            <h3>No Interests Yet</h3>
            <p>
              You haven't expressed interest in any listings yet.
            </p>
          </div>
        ) : (
          <table className="interest-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Rent</th>
                <th>Match</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {interests.map((i) => (
                <tr key={i._id}>
                  <td>{i.listing?.location}</td>

                  <td>₹{i.listing?.rent}</td>

                  <td>
                    {i.compatibilityScore
                      ? `${i.compatibilityScore.score}%`
                      : "--"}
                  </td>

                  <td>
                    <span className={`status-pill ${i.status}`}>
                      {i.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}