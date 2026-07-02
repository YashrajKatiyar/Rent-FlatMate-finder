import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaHouseUser } from "react-icons/fa";
import "./Navbar.css";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <div className="logo">

        <FaHouseUser />
        <div className="logo-text">
          <Link to="/">RentMate AI</Link>
          <span>Smart Flatmate Matching</span>
        </div>
      </div>

      <div className="nav-links">

        {!user && (
          <>
            <Link to="/login">Login</Link>

            <Link className="register-btn" to="/register">
              Register
            </Link>
          </>
        )}

        {user?.role === "tenant" && (
          <>
            <Link to="/tenant">Dashboard</Link>
            <Link to="/tenant/profile">Profile</Link>
            <Link to="/tenant/interests">Interests</Link>
          </>
        )}

        {user?.role === "owner" && (
          <>
            <Link to="/owner">Dashboard</Link>
            <Link to="/owner/interests">Requests</Link>
          </>
        )}

        {user?.role === "admin" && (
          <Link to="/admin">Admin</Link>
        )}

        {user && (
          <>
            <Link to="/chat">Chat</Link>

            <button onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

      </div>

    </nav>
  );
}