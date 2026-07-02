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
  <div style={{ padding: "50px", background: "red", color: "white" }}>
    <h1>NEW TENANT PROFILE</h1>
  </div>
);
}