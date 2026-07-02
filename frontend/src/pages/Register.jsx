import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await register(form);
      navigate(user.role === "tenant" ? "/tenant" : "/owner");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">

      <h1>Create Account</h1>

      <p className="auth-subtitle">
        Join RentMate AI and find your perfect roommate using AI.
      </p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>

        <label>I am a...</label>

        <div className="role-toggle">
          <button
            type="button"
            className={form.role === "tenant" ? "active" : ""}
            onClick={() => setForm({ ...form, role: "tenant" })}
          >
            Tenant
          </button>

          <button
            type="button"
            className={form.role === "owner" ? "active" : ""}
            onClick={() => setForm({ ...form, role: "owner" })}
          >
            Room Owner
          </button>
        </div>

        <label>Full Name</label>

        <div className="input-group">
          <FaUser className="input-icon" />

          <input
            type="text"
            required
            placeholder="John Doe"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        <label>Email</label>

        <div className="input-group">
          <FaEnvelope className="input-icon" />

          <input
            type="email"
            required
            placeholder="john@email.com"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        <label>Password</label>

        <div className="input-group">
          <FaLock className="input-icon" />

          <input
            type="password"
            minLength={6}
            required
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </button>

      </form>

      <div className="auth-footer">
        Already have an account?{" "}
        <Link to="/login">Login</Link>
      </div>

    </div>
  );
}