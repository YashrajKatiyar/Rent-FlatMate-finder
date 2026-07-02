import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(form.email, form.password);

      if (user.role === "tenant") navigate("/tenant");
      else if (user.role === "owner") navigate("/owner");
      else navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">

      <h1>Welcome Back 👋</h1>

      <p className="auth-subtitle">
        Login to continue finding your perfect room and flatmate.
      </p>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>

        <label>Email Address</label>

        <div className="input-group">
          <FaEnvelope className="input-icon" />

          <input
            type="email"
            placeholder="Enter your email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />
        </div>

        <label>Password</label>

        <div className="input-group">
          <FaLock className="input-icon" />

          <input
            type="password"
            placeholder="Enter your password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? (
            "Logging in..."
          ) : (
            <>
              Login
              <FaArrowRight style={{ marginLeft: "8px" }} />
            </>
          )}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account?{" "}
        <Link to="/register">Create one</Link>
      </p>

    </div>
  );
}